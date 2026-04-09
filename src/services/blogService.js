import { supabase } from '../lib/supabase';

export async function getAllBlogs() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBlogById(id) {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createBlog(blogData) {
  const { data, error } = await supabase
    .from('blogs')
    .insert([blogData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBlog(id, blogData) {
  const { data, error } = await supabase
    .from('blogs')
    .update(blogData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBlog(id) {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function toggleBlogStatus(id, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  const { data, error } = await supabase
    .from('blogs')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
