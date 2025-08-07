/**
 * MDX示例模板
 * 提供各种类型的MDX内容示例，帮助用户快速开始写作
 */

export interface MDXExample {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'basic' | 'advanced' | 'code' | 'structure';
}

export const mdxExamples: MDXExample[] = [
  {
    id: 'basic-article',
    name: '基础文章',
    description: '包含标题、段落、列表的基础文章结构',
    category: 'basic',
    content: `# 文章标题

## 文章简介

这是一篇文章的开头部分，用于介绍文章的主要内容和背景。

## 文章主要内容

### 第一个要点

这里可以详细说明第一个要点，包含相关的信息和解释。

### 第二个要点

继续展开第二个要点，提供更多细节和例子。

## 内容列表示例

### 无序列表
- 项目一
- 项目二
- 项目三
  - 子项目A
  - 子项目B

### 有序列表
1. 第一步
2. 第二步
3. 第三步

## 文章总结

在结尾部分总结文章的主要观点和结论。`
  },
  {
    id: 'code-example',
    name: '代码示例',
    description: '包含代码块和语法高亮的示例',
    category: 'code',
    content: `# 代码示例

## JavaScript 示例

\`\`\`javascript
// 函数定义
function greet(name) {
  return \`Hello, \${name}!\`;
}

// 使用示例
const message = greet('World');
console.log(message); // 输出: Hello, World!
\`\`\`

## Python 示例

\`\`\`python
# 类定义
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        return f"我叫{self.name}，今年{self.age}岁"

# 使用示例
person = Person("张三", 25)
print(person.introduce())
\`\`\`

## 命令行示例

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build
\`\`\`

## 内联代码

在文本中使用 \`代码片段\` 可以让内容更加清晰。`
  },
  {
    id: 'table-example',
    name: '表格示例',
    description: '展示Markdown表格的使用方法',
    category: 'structure',
    content: `# 表格示例

## 基础表格

| 姓名 | 年龄 | 职业 | 城市 |
|------|------|------|------|
| 张三 | 25 | 工程师 | 北京 |
| 李四 | 30 | 设计师 | 上海 |
| 王五 | 28 | 产品经理 | 深圳 |

## 复杂表格

### 功能对比表

| 功能 | 基础版 | 专业版 | 企业版 |
|------|--------|--------|--------|
| 用户数量 | 10 | 100 | 无限 |
| 存储空间 | 1GB | 10GB | 100GB |
| 技术支持 | 邮件 | 邮件+电话 | 专属客服 |
| 价格 | 免费 | ¥99/月 | ¥299/月 |

## 对齐方式

| 左对齐 | 居中对齐 | 右对齐 |
|:------|:-------:|------:|
| 内容1 | 内容2 | 内容3 |
| 左边 | 中间 | 右边 |
| L | C | R |`
  },
  {
    id: 'media-example',
    name: '媒体内容',
    description: '包含链接、图片和引用的示例',
    category: 'advanced',
    content: `# 媒体内容示例

## 链接

### 文本链接
这是一个[普通链接](https://example.com)的示例。

### 带标题的链接
这是一个[带标题的链接](https://example.com "鼠标悬停显示的标题")。

### 参考链接
这是一个[参考链接][1]的示例。

[1]: https://example.com

## 图片

### 基础图片
![alt文本](https://via.placeholder.com/400x200)

### 带标题的图片
![示例图片](https://via.placeholder.com/400x200 "这是一个示例图片")

## 引用

### 基础引用
> 这是一个引用示例。
> 
> 引用可以跨越多行，
> 适合引用重要的内容。

### 嵌套引用
> 第一层引用
>
> > 第二层引用
> >
> > > 第三层引用

## 分割线

---

上面是一个分割线

***

也可以使用三个星号

___
或者三个下划线

## 强调文本

**粗体文本**
*斜体文本*
***粗斜体文本***
~~删除线文本~~

## 行内代码

使用 \`console.log()\` 输出调试信息。`
  },
  {
    id: 'tutorial-example',
    name: '教程示例',
    description: '完整的教程类文章结构',
    category: 'structure',
    content: `# 完整教程：从零开始学习

## 📋 概述

本教程将指导您完成从基础到进阶的完整学习过程。预计阅读时间：15分钟。

## 🎯 学习目标

完成本教程后，您将能够：
- 理解核心概念和原理
- 掌握基本操作方法
- 能够独立完成实际项目
- 了解最佳实践和注意事项

## 🔧 环境准备

### 系统要求
- 操作系统：Windows/macOS/Linux
- 内存：至少4GB RAM
- 硬盘空间：2GB可用空间

### 开发环境安装步骤

1. **下载安装包**
   \`\`\`bash
   wget https://example.com/package.tar.gz
   \`\`\`

2. **解压文件**
   \`\`\`bash
   tar -xzf package.tar.gz
   cd package
   \`\`\`

3. **运行安装脚本**
   \`\`\`bash
   ./install.sh
   \`\`\`

## 📚 核心概念

### 概念一：基础理论

**定义**：这是对核心概念的定义和解释。

**特点**：
- 特点A：详细说明
- 特点B：具体描述
- 特点C：实际应用

### 概念二：实践应用

在实际项目中，我们需要考虑以下几个方面：

| 方面 | 说明 | 重要性 |
|------|------|--------|
| 性能 | 影响用户体验 | 高 |
| 安全 | 保护数据安全 | 高 |
| 可维护性 | 便于后续开发 | 中 |

## 💻 实战练习

### 练习1：基础操作

**任务目标**：完成一个简单的基础操作

**操作步骤**：
1. 打开终端或命令行工具
2. 输入以下命令：
   \`\`\`bash
   # 初始化项目
   npm init -y
   
   # 安装依赖
   npm install package-name
   \`\`\`

3. 验证安装结果：
   \`\`\`bash
   package-name --version
   \`\`\`

### 练习2：进阶功能

**代码示例**：
\`\`\`javascript
// 进阶功能示例
const advancedFunction = (params) => {
  // 参数验证
  if (!params) {
    throw new Error('参数不能为空');
  }
  
  // 核心逻辑
  const result = params.map(item => {
    return {
      ...item,
      processed: true,
      timestamp: Date.now()
    };
  });
  
  return result;
};
\`\`\`

## ⚠️ 常见问题

### 常见安装问题
**现象**：安装过程中出现错误提示

**解决方案**：
1. 检查网络连接
2. 清理缓存：\`npm cache clean --force\`
3. 重新安装：\`npm install\`

### 系统权限相关问题
**现象**：遇到权限相关的错误

**解决方案**：

\`\`\`bash
# macOS/Linux
sudo npm install

# Windows
以管理员身份运行命令提示符
\`\`\`

## 🎉 教程总结

### 关键要点回顾
- ✅ 掌握了基础概念和理论
- ✅ 学会了实际操作方法
- ✅ 了解了常见问题和解决方案
- ✅ 能够独立完成项目开发

### 下一步建议
1. **深入学习**：继续学习进阶内容
2. **实践项目**：通过实际项目巩固知识
3. **社区参与**：加入相关社区，交流经验
4. **持续更新**：关注最新的发展和趋势

### 参考资源
- [官方文档](https://example.com/docs)
- [社区论坛](https://example.com/community)
- [视频教程](https://example.com/videos)

---

> 💡 **提示**：如果您在学习过程中遇到问题，欢迎在评论区留言，我会及时回复。

📧 **联系我**：[your-email@example.com](mailto:your-email@example.com)`
  },
  {
    id: 'empty-template',
    name: '空白模板',
    description: '清空编辑器内容',
    category: 'basic',
    content: ''
  }
];

// 按类别分组示例
export const getExamplesByCategory = (category: MDXExample['category']) => {
  return mdxExamples.filter(example => example.category === category);
};

// 获取所有类别
export const getCategories = () => {
  const categories = [...new Set(mdxExamples.map(example => example.category))];
  return categories.map(category => ({
    id: category,
    name: {
      basic: '基础',
      advanced: '高级',
      code: '代码',
      structure: '结构'
    }[category],
    examples: getExamplesByCategory(category)
  }));
};

// 根据ID获取示例
export const getExampleById = (id: string) => {
  return mdxExamples.find(example => example.id === id);
};