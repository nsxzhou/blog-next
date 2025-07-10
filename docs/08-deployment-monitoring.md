# 部署与监控指南

## 1. Docker 部署

### 1.1 Dockerfile
```dockerfile
# 多阶段构建
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./
RUN npm ci --only=production

# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED 1

# 构建应用
RUN npm run build

# 运行阶段
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 1.2 Docker Compose
`docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/blog_db
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    volumes:
      - uploads:/app/uploads

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=blog_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - nginx_cache:/var/cache/nginx
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  uploads:
  nginx_cache:
```

### 1.3 Nginx 配置
`nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml application/atom+xml image/svg+xml;

    # 缓存设置
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;

    # 上游服务器
    upstream nextjs_upstream {
        server app:3000;
    }

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS 服务器配置
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # 安全头部
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 静态文件缓存
        location /_next/static {
            proxy_cache STATIC;
            proxy_pass http://nextjs_upstream;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        location /static {
            proxy_cache STATIC;
            proxy_ignore_headers Cache-Control;
            proxy_cache_valid 60m;
            proxy_pass http://nextjs_upstream;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # 图片缓存
        location ~* \.(jpg|jpeg|png|gif|ico|webp|svg)$ {
            proxy_cache STATIC;
            proxy_ignore_headers Cache-Control;
            proxy_cache_valid 60m;
            proxy_pass http://nextjs_upstream;
            add_header Cache-Control "public, max-age=86400, must-revalidate";
        }

        # API 路由
        location /api {
            proxy_pass http://nextjs_upstream;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # 默认路由
        location / {
            proxy_pass http://nextjs_upstream;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

## 2. 监控配置

### 2.1 日志管理
`lib/logger.ts`:
```typescript
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logDir = "logs";

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 创建 Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "blog-app" },
  transports: [
    // 错误日志
    new DailyRotateFile({
      filename: `${logDir}/error-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    // 组合日志
    new DailyRotateFile({
      filename: `${logDir}/combined-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
    // 访问日志
    new DailyRotateFile({
      filename: `${logDir}/access-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxSize: "20m",
      maxFiles: "7d",
    }),
  ],
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;

// 请求日志中间件
export function requestLogger(req: Request) {
  const start = Date.now();
  const { method, url, headers } = req;

  logger.info("Request", {
    method,
    url,
    userAgent: headers.get("user-agent"),
    ip: headers.get("x-forwarded-for") || headers.get("x-real-ip"),
    timestamp: new Date().toISOString(),
  });

  return {
    logResponse: (status: number) => {
      const duration = Date.now() - start;
      logger.info("Response", {
        method,
        url,
        status,
        duration,
        timestamp: new Date().toISOString(),
      });
    },
  };
}
```

### 2.2 错误监控 (Sentry)
`lib/monitoring/sentry.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: false,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    beforeSend(event, hint) {
      // 过滤敏感信息
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event;
    },

    ignoreErrors: [
      // 忽略一些常见的客户端错误
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  console.error("Error captured:", error);

  Sentry.captureException(error, {
    extra: context,
    tags: {
      section: context?.section || "unknown",
    },
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info"
) {
  Sentry.captureMessage(message, level);
}
```

### 2.3 性能监控
`app/api/analytics/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, properties } = body;

    // 记录事件
    await prisma.analytics.create({
      data: {
        event_type: event,
        properties,
        user_agent: request.headers.get("user-agent"),
        ip_address: request.headers.get("x-forwarded-for"),
        created_at: new Date(),
      },
    });

    // 特殊事件处理
    switch (event) {
      case "page_view":
        await handlePageView(properties);
        break;
      case "post_view":
        await handlePostView(properties);
        break;
      case "search":
        await handleSearch(properties);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record analytics" },
      { status: 500 }
    );
  }
}

async function handlePageView(properties: any) {
  // 更新页面访问统计
  const { path, referrer } = properties;
  
  await prisma.pageViews.upsert({
    where: { path },
    update: { count: { increment: 1 } },
    create: { path, count: 1 },
  });
}

async function handlePostView(properties: any) {
  const { postId } = properties;
  
  // 更新文章浏览量
  await prisma.post.update({
    where: { id: postId },
    data: { view_count: { increment: 1 } },
  });
}

async function handleSearch(properties: any) {
  const { query, results_count, user_id } = properties;
  
  // 记录搜索历史
  await prisma.searchHistory.create({
    data: {
      query,
      results_count,
      user_id,
    },
  });
}
```

## 3. 健康检查和监控

### 3.1 健康检查端点
`app/api/health/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";

export async function GET() {
  const checks = {
    server: "ok",
    database: "checking",
    redis: "checking",
    timestamp: new Date().toISOString(),
  };

  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (error) {
    checks.database = "error";
  }

  try {
    // 检查 Redis 连接
    await redis.ping();
    checks.redis = "ok";
  } catch (error) {
    checks.redis = "error";
  }

  const allHealthy = Object.values(checks).every(
    (status) => status === "ok" || typeof status === "string"
  );

  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503,
  });
}
```

### 3.2 监控仪表板
`app/admin/monitoring/page.tsx`:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MonitoringDashboard() {
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => fetch("/api/admin/metrics").then((res) => res.json()),
    refetchInterval: 30000, // 30秒刷新一次
  });

  const pageViewsData = {
    labels: metrics?.pageViews?.labels || [],
    datasets: [
      {
        label: "页面访问量",
        data: metrics?.pageViews?.data || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const errorRateData = {
    labels: metrics?.errors?.labels || [],
    datasets: [
      {
        label: "错误率",
        data: metrics?.errors?.data || [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">系统监控</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="总访问量"
          value={metrics?.totalViews || 0}
          change={metrics?.viewsChange || 0}
        />
        <MetricCard
          title="活跃用户"
          value={metrics?.activeUsers || 0}
          change={metrics?.usersChange || 0}
        />
        <MetricCard
          title="平均响应时间"
          value={`${metrics?.avgResponseTime || 0}ms`}
          change={metrics?.responseTimeChange || 0}
        />
        <MetricCard
          title="错误率"
          value={`${metrics?.errorRate || 0}%`}
          change={metrics?.errorRateChange || 0}
          isPercentage
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">页面访问趋势</h2>
          <Line data={pageViewsData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">错误统计</h2>
          <Bar data={errorRateData} />
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">实时日志</h2>
        <LogViewer />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  isPercentage = false,
}: {
  title: string;
  value: string | number;
  change: number;
  isPercentage?: boolean;
}) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className={`text-sm mt-1 ${changeColor}`}>
        {isPositive ? "+" : ""}
        {change}
        {isPercentage ? "%" : ""} 较昨日
      </p>
    </div>
  );
}
```

## 4. 备份策略

### 4.1 自动备份脚本
`scripts/backup.sh`:
```bash
#!/bin/bash

# 配置
BACKUP_DIR="/backups"
DB_NAME="blog_db"
DB_USER="root"
DB_PASS="password"
S3_BUCKET="your-backup-bucket"
RETENTION_DAYS=30

# 创建备份目录
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"
mkdir -p $BACKUP_PATH

# 备份数据库
echo "Backing up database..."
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_PATH/database.sql.gz

# 备份上传的文件
echo "Backing up uploaded files..."
tar -czf $BACKUP_PATH/uploads.tar.gz /app/uploads

# 备份配置文件
echo "Backing up config files..."
tar -czf $BACKUP_PATH/config.tar.gz /app/.env /app/config

# 上传到 S3
echo "Uploading to S3..."
aws s3 cp $BACKUP_PATH s3://$S3_BUCKET/backups/$DATE/ --recursive

# 清理旧备份
echo "Cleaning old backups..."
find $BACKUP_DIR -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;
aws s3 ls s3://$S3_BUCKET/backups/ | while read -r line; do
  createDate=$(echo $line | awk '{print $1" "$2}')
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "$RETENTION_DAYS days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk '{print $4}')
    aws s3 rm s3://$S3_BUCKET/backups/$fileName --recursive
  fi
done

echo "Backup completed!"
```

### 4.2 定时任务配置
`crontab`:
```bash
# 每天凌晨2点执行备份
0 2 * * * /scripts/backup.sh >> /logs/backup.log 2>&1

# 每小时检查系统健康状态
0 * * * * curl -f http://localhost:3000/api/health || echo "Health check failed" | mail -s "Blog App Health Check Failed" admin@example.com

# 每周一清理日志
0 0 * * 1 find /logs -name "*.log" -mtime +30 -delete
```