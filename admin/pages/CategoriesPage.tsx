
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import { Plus, Edit2, Trash2, GripVertical, Check, X } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', order: 0 });

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });
    
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      await supabase.from('categories').update(form).eq('id', isEditing);
    } else {
      await supabase.from('categories').insert([form]);
    }
    setForm({ name: '', order: categories.length + 1 });
    setIsEditing(null);
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    setIsEditing(category.id);
    setForm({ name: category.name, order: category.order });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta categoria?')) {
      await supabase.from('categories').delete().eq('id', id);
      fetchCategories();
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Categorias</h1>
          <p className="text-zinc-500">Gerencie as sessões do seu cardápio.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-4 mb-8 bg-zinc-800/50 p-6 rounded-xl border border-zinc-700">
          <div className="flex-1">
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Nome da Categoria</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
              placeholder="Ex: Pizzas, Bebidas..."
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Ordem</label>
            <input
              type="number"
              required
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="bg-white text-zinc-950 font-bold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2">
              {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Atualizar' : 'Adicionar'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={() => { setIsEditing(null); setForm({ name: '', order: 0 }); }}
                className="bg-zinc-700 text-white px-4 py-2.5 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          {loading ? (
            <p className="text-center py-10 text-zinc-500">Carregando categorias...</p>
          ) : categories.length === 0 ? (
            <p className="text-center py-10 text-zinc-500">Nenhuma categoria cadastrada.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-800/30 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="text-zinc-600 group-hover:text-zinc-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{cat.name}</h3>
                    <p className="text-xs text-zinc-500 uppercase">Ordem: {cat.order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(cat)}
                    className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
