import { Heart, Trash2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function PostCard({ post, onLike, onDelete }) {
  const user = useAuthStore((s) => s.user);
  const canDelete = user && (user.id === post.author?._id || user.role === 'admin');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {post.company && (
              <span className="text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5">
                {post.company}
              </span>
            )}
            {post.tags?.map((tag) => (
              <span key={tag} className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
          <h3 className="text-sm font-medium text-slate-900 mt-2">{post.title}</h3>
        </div>
        {canDelete && (
          <button onClick={() => onDelete(post.id)} aria-label="Delete post" className="text-slate-300 hover:text-red-500 shrink-0">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{post.content}</p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          {post.author?.name || 'Unknown'} {post.author?.college && `· ${post.author.college}`} ·{' '}
          {new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </p>
        <button
          onClick={() => onLike(post.id)}
          aria-label={post.likedByMe ? 'Unlike post' : 'Like post'}
          aria-pressed={post.likedByMe}
          className={`flex items-center gap-1 text-xs font-medium ${post.likedByMe ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
        >
          <Heart size={14} fill={post.likedByMe ? 'currentColor' : 'none'} />
          {post.likeCount}
        </button>
      </div>
    </div>
  );
}