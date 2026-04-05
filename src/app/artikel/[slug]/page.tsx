'use client'

import { useParams } from 'next/navigation'
import Image from "next/image";
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { ContentLayout } from '@/components/panel/content-layout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'
import Link from 'next/link'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { data, isLoading } = useSWR(`/api/blog/${slug}`, fetcher)

  if (isLoading) {
    return (
      <ContentLayout title="Blog">
        <div className="h-[80vh] flex justify-center items-center">
          <LoadingSpinner size={40} />
        </div>
      </ContentLayout>
    )
  }

  const blog = data?.blog

  if (!blog) {
    return (
      <ContentLayout title="Blog">
        <div className="text-center py-20">Blog tidak ditemukan</div>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title={blog.title}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground">
          <Link href="/artikel" className="hover:underline">
            Artikel
          </Link>{' '}
          / {blog.title}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight">{blog.title}</h1>

        {/* Featured Image */}
        <Image
          src={blog.image}
          alt={blog.title}
          width={640}
          height={360}
          className="rounded-lg w-full h-auto object-cover"
        />

        {/* Meta Info */}
        <div className="text-sm text-muted-foreground flex items-center justify-between">
          <span>{format(new Date(blog.published_at), 'dd MMM yyyy')}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {blog.views}
          </span>
        </div>

        {/* Content */}
        <article
          className="prose dark:prose-invert max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </ContentLayout>
  )
}