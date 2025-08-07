import { PostListItem } from "@/components/blog/post/PostListItem";
import { Post } from "@/types/blog/post";
import { PostsEmptyState } from "@/components/ui/empty-state";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * 文章列表组件
 * 
 * 功能：以列表形式展示文章，支持分页
 * 特点：极简设计，无装饰，融为一体的展示
 */
interface PostsListProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
}

export function PostsList({ posts, currentPage, totalPages }: PostsListProps) {
  // 过滤已发布的文章
  const publishedPosts = posts.filter(post => post.status === 'PUBLISHED');
  
  // 如果没有已发布的文章，显示空状态
  if (publishedPosts.length === 0) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <PostsEmptyState />
        </div>
      </section>
    );
  }

  // 生成分页链接
  const generatePageUrl = (page: number) => `/?page=${page}`;

  // 生成分页数字范围
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      // 少于等于7页，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 多于7页，显示省略号
      if (currentPage <= 4) {
        // 当前页在前面
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 当前页在后面
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // 当前页在中间
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 文章列表 */}
          <div className="space-y-0">
            {publishedPosts.map((post) => (
              <PostListItem key={post.id} post={post} showImage={true} />
            ))}
          </div>

          {/* 分页控制 */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                {/* 上一页 */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={generatePageUrl(currentPage - 1)} />
                  </PaginationItem>
                )}

                {/* 页码 */}
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href={generatePageUrl(page as number)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                {/* 下一页 */}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={generatePageUrl(currentPage + 1)} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </section>
  );
}