import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Clock, Megaphone, ShieldCheck, Image as ImageIcon, MessageSquareMore, ExternalLink, Loader2 } from 'lucide-react';
import { feedPostService } from '@/services/feedPostService';
import { commentService, CommentDto } from '@/services/commentService';
import { FeedPostDto } from '@/types/feedPost';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

const FeedItem = ({ post }: { post: FeedPostDto }) => {
    const getIcon = () => {
        if (post.targetType === 'EXPENDITURE') return <ShieldCheck size={14} className="text-green-600" />;
        if (post.targetType === 'CAMPAIGN') return <Megaphone size={14} className="text-blue-600" />;
        return <MessageSquareMore size={14} className="text-slate-500" />;
    };

    const getTypeClass = () => {
        if (post.targetType === 'EXPENDITURE') return 'evidence';
        if (post.targetType === 'CAMPAIGN') return 'emergency';
        return 'update';
    };

    const hasTag = post.targetName && post.targetName.trim() !== '';

    return (
        <div className="feed-item">
            <div className="feed-left">
                <div className={`icon-circle ${getTypeClass()}`}>
                    {getIcon()}
                </div>
                <div className="line"></div>
            </div>
            <div className="feed-content">
                <div className="feed-header">
                    {hasTag ? (
                        <div className="campaign-tag">
                            <Tag size={10} />
                            <span>{post.targetName}</span>
                        </div>
                    ) : (
                        <div className="no-tag-spacer"></div>
                    )}
                    <span className="feed-date">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                </div>
                <div className="feed-body">
                    {post.title && <h4 className="post-title">{post.title}</h4>}
                    <p className="text">{post.content}</p>
                    {post.attachments && post.attachments.length > 0 && (
                        <div className="image-grid">
                            {post.attachments.map((img, idx) => (
                                <div key={idx} className="post-img" style={{ backgroundImage: `url(${img.url})` }}></div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="feed-actions">
                    <Link href={`/post/${post.id}`} className="view-details">
                        <span>Xem bài viết gốc</span>
                        <ExternalLink size={10} />
                    </Link>
                </div>
            </div>
            <style jsx>{`
        .feed-item { display: flex; gap: 16px; }
        .feed-left { display: flex; flex-direction: column; align-items: center; }
        .icon-circle { 
            width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            border: 2px solid transparent; flex-shrink: 0;
        }
        .icon-circle.emergency { background: #eff6ff; border-color: #dbeafe; }
        .icon-circle.evidence { background: #f0fdf4; border-color: #dcfce7; }
        .icon-circle.update { background: #f8fafc; border-color: #f1f5f9; }
        .line { width: 1.5px; flex: 1; background: #f1f5f9; margin: 4px 0; }
        
        .feed-content { flex: 1; padding-bottom: 32px; }
        .feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .campaign-tag { 
            display: flex; align-items: center; gap: 5px; padding: 4px 10px; 
            background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
            font-size: 11px; font-weight: 700; color: #475569;
        }
        .feed-date { font-size: 11px; color: #94a3b8; font-weight: 500; }
        
        .feed-body { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 12px; transition: box-shadow 0.2s; }
        .feed-body:hover { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
        .post-title { margin: 0 0 8px 0; font-size: 14px; font-weight: 800; color: #1e293b; }
        .text { font-size: 13px; color: #334155; line-height: 1.6; margin: 0; }
        
        .image-grid { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
        .post-img { 
            width: 120px; height: 80px; background-size: cover; background-position: center;
            border-radius: 8px; border: 1px solid #f1f5f9;
        }

        .view-details { 
            display: inline-flex; align-items: center; gap: 4px;
            background: none; border: none; color: #dc2626; font-size: 10px; font-weight: 800; 
            padding: 0; cursor: pointer; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .view-details:hover { text-decoration: underline; }
      `}</style>
        </div>
    );
};

const CommentItem = ({ comment }: { comment: CommentDto }) => {
    const isReply = !!comment.parentCommentId;

    const getPostIcon = (type: string | undefined | null) => {
        if (type === 'EXPENDITURE') return <ShieldCheck size={10} className="text-green-600" />;
        if (type === 'CAMPAIGN') return <Megaphone size={10} className="text-blue-600" />;
        return <MessageSquareMore size={10} className="text-slate-500" />;
    };

    return (
        <div className="comment-item-container">
            {/* Context Card (Post or Parent Comment) */}
            <div className="context-card">
                {isReply ? (
                    <div className="parent-comment-mini">
                        <div className="author-row">
                            <div className="mini-avatar" style={{ backgroundImage: `url(${comment.parentAuthorAvatar || '/default-avatar.png'})` }}></div>
                            <span className="mini-name">{comment.parentAuthorName || 'Thành viên'}</span>
                        </div>
                        <p className="mini-content">{comment.parentContent}</p>
                    </div>
                ) : (
                    <div className="post-mini">
                        <div className="post-mini-header">
                            <div className="icon-wrap">{getPostIcon(comment.postType)}</div>
                            <div className="post-tag-mini">{comment.postTargetName}</div>
                        </div>
                        <h5 className="post-mini-title">{comment.postTitle}</h5>
                        <div className="post-mini-meta">
                            <span>{comment.postAuthorName}</span>
                            <span className="dot">•</span>
                            <span>{comment.postCreatedAt ? formatDistanceToNow(new Date(comment.postCreatedAt), { locale: vi }) : ''}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Connecting Line and Owner's Comment */}
            <div className="owner-comment-row">
                <div className="connector-line"></div>
                <div className="owner-comment-content">
                    <div className="owner-header">
                        <div className="owner-avatar" style={{ backgroundImage: `url(${comment.authorAvatar || '/default-avatar.png'})` }}></div>
                        <div className="owner-info">
                            <span className="owner-name">{comment.authorName}</span>
                            <span className="owner-date">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}</span>
                        </div>
                    </div>
                    <div className="owner-bubble">
                        <p>{comment.content}</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .comment-item-container { margin-bottom: 12px; padding-bottom: 4px; }
                
                .context-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 10px; padding: 12px; margin-left: 16px; border-left: 3px solid #e2e8f0; }
                
                .parent-comment-mini .author-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
                .mini-avatar { width: 18px; height: 18px; border-radius: 50%; background-size: cover; background-position: center; }
                .mini-name { font-size: 11px; font-weight: 700; color: #1e293b; }
                .mini-content { font-size: 11px; color: #64748b; line-height: 1.4; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                
                .post-mini-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
                .post-tag-mini { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; background: #f8fafc; padding: 2px 6px; border-radius: 4px; }
                .post-mini-title { font-size: 11px; font-weight: 800; color: #1e293b; margin: 0 0 4px 0; }
                .post-mini-meta { font-size: 9px; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
                
                .owner-comment-row { display: flex; gap: 16px; margin-top: -4px; }
                .connector-line { width: 2px; background: #f1f5f9; margin-left: 28px; height: 20px; flex-shrink: 0; }
                
                .owner-comment-content { flex: 1; }
                .owner-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
                .owner-avatar { width: 28px; height: 28px; border-radius: 50%; background-size: cover; background-position: center; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .owner-info { display: flex; flex-direction: column; }
                .owner-name { font-size: 12px; font-weight: 800; color: #1e293b; }
                .owner-date { font-size: 10px; color: #94a3b8; }
                
                .owner-bubble { background: #f1f5f9; border-radius: 12px; border-top-left-radius: 2px; padding: 10px 14px; }
                .owner-bubble p { font-size: 12px; color: #334155; line-height: 1.5; margin: 0; }
            `}</style>
        </div>
    );
};

const ActivityFeedTab = ({ id }: { id: string | number }) => {
    const [filter, setFilter] = useState('Tất cả');
    const [posts, setPosts] = useState<FeedPostDto[]>([]);
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const filters = ['Tất cả', 'Bài đăng bình thường', 'Bài đăng cho quỹ', 'Bài đăng minh chứng'];

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const res = await feedPostService.getByAuthor(Number(id));
            if (res && res.content) {
                setPosts(res.content);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]); // Clear posts on error to avoid stale data
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchComments = useCallback(async () => {
        try {
            setLoadingComments(true);
            const res = await commentService.getByUser(Number(id));
            if (res && res.content) {
                setComments(res.content);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
        } finally {
            setLoadingComments(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPosts();
        fetchComments();
    }, [fetchPosts, fetchComments]);

    const filteredPosts = posts.filter(post => {
        if (filter === 'Tất cả') return true;
        if (filter === 'Bài đăng bình thường') return !post.targetType;
        if (filter === 'Bài đăng cho quỹ') return post.targetType === 'CAMPAIGN';
        if (filter === 'Bài đăng minh chứng') return post.targetType === 'EXPENDITURE';
        return true;
    });

    return (
        <div className="activity-tab-container">
            <div className="activity-grid">
                {/* Left Column: Posts */}
                <div className="posts-column">
                    <div className="filter-bar">
                        {filters.map(f => (
                            <button
                                key={f}
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="feed-list">
                        {loading ? (
                            <div className="loading-state">
                                <Loader2 className="animate-spin text-slate-300" size={32} />
                            </div>
                        ) : filteredPosts.length > 0 ? (
                            filteredPosts.map(post => <FeedItem key={post.id} post={post} />)
                        ) : (
                            <div className="empty-state">Chưa có bài đăng nào</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Comments */}
                <div className="comments-column">
                    <div className="column-header">
                        <h3>Bình luận của chủ quỹ</h3>
                    </div>
                    <div className="comments-list">
                        {loadingComments ? (
                            <div className="loading-state-mini">
                                <Loader2 className="animate-spin text-slate-300" size={24} />
                            </div>
                        ) : comments.length > 0 ? (
                            comments.map(c => <CommentItem key={c.id} comment={c} />)
                        ) : (
                            <div className="empty-state">Chưa có bình luận nào</div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .activity-tab-container { padding: 32px; background: #fff; height: calc(100vh - 250px); overflow: hidden; display: flex; flex-direction: column; }
        .activity-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; width: 100%; height: 100%; min-height: 0; margin: 0 auto; }
        
        .posts-column { border-right: 1px solid #f1f5f9; padding-right: 32px; height: 100%; overflow-y: auto; }
        .filter-bar { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; position: sticky; top: 0; background: #fff; z-index: 10; padding-bottom: 12px; }
        .filter-btn { 
          padding: 6px 14px; border-radius: 99px; border: 1px solid #e2e8f0; 
          background: #fff; font-size: 11px; font-weight: 600; color: #64748b; cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .filter-btn.active { background: #dc2626; color: #fff; border-color: #dc2626; }
        
        .feed-list { display: flex; flex-direction: column; gap: 12px; }
        .loading-state, .empty-state { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; display: flex; justify-content: center; align-items: center; height: 200px; }
        .loading-state-mini { padding: 20px; text-align: center; display: flex; justify-content: center; }

        .comments-column { height: 100%; overflow-y: auto; padding-right: 8px; }
        .column-header { margin-bottom: 24px; border-bottom: 2px solid #f8fafc; padding-bottom: 12px; position: sticky; top: 0; background: #fff; z-index: 10; }
        .column-header h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; }
        .comments-list { display: flex; flex-direction: column; gap: 4px; }
        
        /* Custom scrollbar for columns */
        .posts-column::-webkit-scrollbar, .comments-column::-webkit-scrollbar { width: 4px; }
        .posts-column::-webkit-scrollbar-track, .comments-column::-webkit-scrollbar-track { background: transparent; }
        .posts-column::-webkit-scrollbar-thumb, .comments-column::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
        .posts-column:hover::-webkit-scrollbar-thumb, .comments-column:hover::-webkit-scrollbar-thumb { background: #e2e8f0; }

        @media (max-width: 1200px) {
            .activity-grid { gap: 32px; }
        }

        @media (max-width: 992px) {
            .activity-tab-container { height: auto; overflow: visible; }
            .activity-grid { grid-template-columns: 1fr; height: auto; display: block; }
            .posts-column { border-right: none; padding-right: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; height: auto; overflow: visible; }
            .comments-column { height: auto; overflow: visible; }
        }
      `}</style>
        </div>
    );
};

export default ActivityFeedTab;
