import Link from "next/link"

/**
 * 全局 404 页面
 * 当用户访问不存在的页面时显示
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-6xl font-bold text-gray-800 mb-4">404</h2>
      <h3 className="text-2xl font-semibold mb-4">页面未找到</h3>
      <p className="text-gray-600 mb-8">抱歉，您访问的页面不存在。</p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}