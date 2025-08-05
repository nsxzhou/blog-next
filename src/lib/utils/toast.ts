import { toast } from 'sonner'

/**
 * 全局提示工具类
 * 提供统一的提示接口，遵循 KISS 原则
 */
export class ToastHelper {
  /**
   * 显示成功提示
   * @param message 提示消息
   */
  static success(message: string) {
    toast.success(message)
  }

  /**
   * 显示错误提示
   * @param message 提示消息
   */
  static error(message: string) {
    toast.error(message)
  }

  /**
   * 显示信息提示
   * @param message 提示消息
   */
  static info(message: string) {
    toast.info(message)
  }

  /**
   * 显示警告提示
   * @param message 提示消息
   */
  static warning(message: string) {
    toast.warning(message)
  }

  /**
   * 显示加载中的提示
   * @param message 提示消息
   * @returns Promise 用于控制提示的生命周期
   */
  static loading(message: string = '加载中...') {
    return toast.loading(message)
  }

  /**
   * 关闭指定的提示
   * @param id 提示ID
   */
  static dismiss(id: string | number) {
    toast.dismiss(id)
  }

  /**
   * 关闭所有提示
   */
  static clear() {
    toast.dismiss()
  }
}