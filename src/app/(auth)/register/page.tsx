"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

// 使用与后端一致的验证规则
const registerSchema = z
  .object({
    name: z.string().min(2, "姓名至少2个字符").max(50, "姓名不能超过50个字符"),
    email: z.string().email("请输入有效的邮箱地址").max(100, "邮箱地址过长"),
    password: z.string()
      .min(6, "密码至少6个字符"),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine(val => val === true, "请同意服务条款和隐私政策"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // 实时验证
    reValidateMode: "onChange", // 重新验证模式
  });

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  // 密码强度检查
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  // 当密码变化时，重新验证确认密码字段
  useEffect(() => {
    if (confirmPassword && confirmPassword.length > 0) {
      trigger("confirmPassword");
    }
  }, [password, trigger]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          setError(result.details[0] || "输入数据无效");
        } else {
          setError(result.error || result.message || "注册失败");
        }
        return;
      }

      // 注册成功，跳转到登录页面
      router.push("/login?registered=true");
    } catch (error) {
      setError("注册失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return "bg-destructive";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return "弱";
    if (strength <= 3) return "中";
    return "强";
  };

  return (
    <div className="w-full">
      {/* 标题区域 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          加入我们
        </h1>
        <p className="text-sm text-muted-foreground font-light">
          创建账户，开始您的创作之旅
        </p>
      </motion.div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
          >
            <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <span className="text-sm text-destructive">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 注册表单 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 姓名输入 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="name" className="block text-sm font-light text-foreground mb-2">
            姓名
          </label>
          <div className="relative">
            <User className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
              focusedField === 'name' ? "text-primary" : "text-muted-foreground"
            )} />
            <input
              {...register("name")}
              type="text"
              id="name"
              autoComplete="name"
              placeholder="张三"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              className={cn(
                "w-full pl-10 pr-3 py-3 bg-background",
                "border rounded-lg transition-all duration-200",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                focusedField === 'name' ? "border-primary" : "border-border",
                errors.name && "border-destructive focus:ring-destructive/20"
              )}
            />
          </div>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-xs text-destructive"
            >
              {errors.name.message}
            </motion.p>
          )}
        </motion.div>

        {/* 邮箱输入 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="email" className="block text-sm font-light text-foreground mb-2">
            邮箱地址
          </label>
          <div className="relative">
            <Mail className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
              focusedField === 'email' ? "text-primary" : "text-muted-foreground"
            )} />
            <input
              {...register("email")}
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={cn(
                "w-full pl-10 pr-3 py-3 bg-background",
                "border rounded-lg transition-all duration-200",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                focusedField === 'email' ? "border-primary" : "border-border",
                errors.email && "border-destructive focus:ring-destructive/20"
              )}
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-xs text-destructive"
            >
              {errors.email.message}
            </motion.p>
          )}
        </motion.div>

        {/* 密码输入 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="password" className="block text-sm font-light text-foreground mb-2">
            密码
          </label>
          <div className="relative">
            <Lock className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
              focusedField === 'password' ? "text-primary" : "text-muted-foreground"
            )} />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              placeholder="••••••••"
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className={cn(
                "w-full pl-10 pr-10 py-3 bg-background",
                "border rounded-lg transition-all duration-200",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                focusedField === 'password' ? "border-primary" : "border-border",
                errors.password && "border-destructive focus:ring-destructive/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* 密码强度指示器 */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                    className={cn("h-full transition-all duration-300", getPasswordStrengthColor(passwordStrength))}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  密码强度: {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                建议包含大小写字母、数字和特殊字符
              </p>
            </motion.div>
          )}

          {errors.password && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-xs text-destructive"
            >
              {errors.password.message}
            </motion.p>
          )}
        </motion.div>

        {/* 确认密码输入 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label htmlFor="confirmPassword" className="block text-sm font-light text-foreground mb-2">
            确认密码
          </label>
          <div className="relative">
            <Lock className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
              focusedField === 'confirmPassword' ? "text-primary" : "text-muted-foreground"
            )} />
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              className={cn(
                "w-full pl-10 pr-10 py-3 bg-background",
                "border rounded-lg transition-all duration-200",
                "placeholder:text-muted-foreground/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                focusedField === 'confirmPassword' ? "border-primary" : "border-border",
                errors.confirmPassword && "border-destructive focus:ring-destructive/20"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-xs text-destructive"
            >
              {errors.confirmPassword.message}
            </motion.p>
          )}
        </motion.div>

        {/* 同意条款 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3"
        >
          <input
            {...register("agreeTerms")}
            type="checkbox"
            id="agree-terms"
            className="mt-1 h-4 w-4 text-primary focus:ring-primary/20 border-border rounded"
          />
          <label htmlFor="agree-terms" className="text-sm font-light text-foreground leading-relaxed">
            我同意{" "}
            <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
              服务条款
            </Link>
            {" "}和{" "}
            <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
              隐私政策
            </Link>
          </label>
        </motion.div>
        {errors.agreeTerms && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-destructive"
          >
            {errors.agreeTerms.message}
          </motion.p>
        )}

        {/* 注册按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full relative group",
              "px-4 py-3 rounded-lg",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                <>
                  创建账户
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </span>
          </button>
        </motion.div>

        {/* 登录链接 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm font-light text-muted-foreground"
        >
          已有账户？{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            立即登录
          </Link>
        </motion.p>
      </form>
    </div>
  );
}