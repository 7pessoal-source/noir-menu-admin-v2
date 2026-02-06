
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { Plus, Edit2, Trash2, Search, ImageIcon, X, Check } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    available: true,
    image_url: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('order', { ascending: true })
    ]);
    if (pRes.data) setProducts(pRes.data);
    if (cRes.data) {
      setCategories(cRes.data);
      if (cRes.data.length > 0 && !form.category_id) setForm(f => ({ ...f, category_id: cRes.data[0].id }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error(err);
      alert('Erro no upload da imagem');
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = form.image_url;
    
    if (imageFile) {
      imageUrl = await handleUpload(imageFile);
    }

    const payload = { ...form, image_url: imageUrl };

    if (isEditing) {
      await supabase.from('products').update(payload).eq('id', isEditing);
    } else {
      await supabase.from('products').insert([payload]);
    }

    setShowModal(false);
    setIsEditing(null);
    setForm({ name: '', description: '', price: 0, category_id: categories[0]?.id || '', available: true, image_url: '' });
    setImageFile(null);
    fetchData();
  };

  const handleEdit = (p: Product) => {
    setIsEditing(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category_id: p.category_id,
      available: p.available,
      image_url: p.image_url
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este produto?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Produtos</h1>
          <p className="text-zinc-500">Gerencie os itens do seu cardápio.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(null); setShowModal(true); }}
          className="bg-white text-zinc-950 font-bold px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-zinc-600" />
          <input 
            type="text"
            placeholder="Buscar produtos..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase font-bold border-b border-zinc-800">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-zinc-500">Carregando produtos...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-zinc-500">Nenhum produto encontrado.</td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {p.image_url ? (
                        <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover bg-zinc-800" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-zinc-600" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-xs text-zinc-500 truncate max-w-[200px]">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-400">
                      {categories.find(c => c.id === p.category_id)?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-200">
                    R$ {p.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      p.available ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {p.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 sticky top-0">
              <h2 className="text-xl font-bold uppercase italic">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Nome do Item</label>
                    <input 
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Categoria</label>
                    <select 
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      value={form.category_id}
                      onChange={e => setForm({...form, category_id: e.target.value})}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Preço (R$)</label>
                    <input 
                      type="number"
                      step="0.01"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      value={form.price}
                      onChange={e => setForm({...form, price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Imagem</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-800 border-dashed rounded-xl hover:border-zinc-700 transition-colors">
                      <div className="space-y-1 text-center">
                        {form.image_url || imageFile ? (
                          <div className="relative inline-block">
                            <img 
                              src={imageFile ? URL.createObjectURL(imageFile) : form.image_url} 
                              className="w-32 h-32 object-cover rounded-lg border border-zinc-700" 
                            />
                            <button 
                              type="button"
                              onClick={() => { setImageFile(null); setForm({...form, image_url: ''}); }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="mx-auto h-12 w-12 text-zinc-700" />
                            <div className="flex text-sm text-zinc-500">
                              <label className="relative cursor-pointer bg-zinc-800 rounded-md font-medium text-white px-2 hover:bg-zinc-700">
                                <span>Upload</span>
                                <input 
                                  type="file" 
                                  className="sr-only" 
                                  accept="image/*"
                                  onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-zinc-600">PNG, JPG até 2MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id="available"
                      className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-zinc-600 focus:ring-zinc-600"
                      checked={form.available}
                      onChange={e => setForm({...form, available: e.target.checked})}
                    />
                    <label htmlFor="available" className="text-sm font-medium text-zinc-400">Disponível para venda</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Descrição</label>
                <textarea 
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Ex: Molho de tomate artesanal, muçarela, basílico fresco..."
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3 sticky bottom-0 bg-zinc-900 pb-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-3 rounded-xl bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? 'Processando...' : (
                    <>
                      <Check className="w-5 h-5" />
                      {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
