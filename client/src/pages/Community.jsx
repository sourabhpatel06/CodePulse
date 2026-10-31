import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import PostCard from '../components/community/PostCard';
import EmptyState from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/Skeleton';
import { getPosts, createPost, toggleLike, deletePost } from '../api/communityService';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', content: '', tags: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async (searchTerm = search, pageNum = page) => {
    setLoading(true);
    setError('');
    try {
      const data = await getPosts({ search: searchTerm, page: pageNum, limit: 10 });
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('', 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(search, 1);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createPost({
        title: form.title,
        company: form.company,
        content: form.content,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setForm({ title: '', company: '', content: '', tags: '' });
      setShowForm(false);
      setSearch('');
      setPage(1);
      load('', 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) } : p
      )
    );
    try {
      const { likeCount, likedByMe } = await toggleLike(id);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likeCount, likedByMe } : p)));
    } catch {
      load(search, page);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const changePage = (newPage) => {
    setPage(newPage);
    load(search, newPage);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Navbar />

        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Community</h1>
            <p className="text-xs text-slate-500 mt-0.5">Interview experiences, shared by everyone</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="text-sm font-medium bg-indigo-600 text-white rounded-lg px-3 py-1.5 hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : '+ Share experience'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 space-y-3">
            <input
              placeholder="Title (e.g. 'Google SDE-1 Interview Experience')"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              placeholder="Company (optional)"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Share your experience…"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              placeholder="Tags, comma separated (e.g. dp, graphs, onsite)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="text-sm font-medium bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </form>
        )}

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            placeholder="Search by title, company, or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-4 hover:bg-slate-50">
            Search
          </button>
        </form>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {loading && (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} />
            ))}
            {posts.length === 0 && (
              <EmptyState
                title={search ? 'No posts match your search' : 'No posts yet'}
                description={search ? 'Try a different keyword or tag.' : 'Be the first to share an interview experience.'}
              />
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => changePage(Math.max(page - 1, 1))} disabled={page <= 1} className="text-sm text-slate-600 disabled:opacity-30">
              ← Prev
            </button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button onClick={() => changePage(Math.min(page + 1, totalPages))} disabled={page >= totalPages} className="text-sm text-slate-600 disabled:opacity-30">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}