import React, { useEffect, useState } from 'react';
import { FolderPlus, Edit, Trash2, Folder, Plus, Save, X, AlertCircle } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import type { CategoryDto } from '../services/api';

interface ManageCategoriesProps {
  navigate: (path: string) => void;
  currentUser: any;
}

export const ManageCategories: React.FC<ManageCategoriesProps> = ({ navigate, currentUser }) => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not teacher or admin
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        throw new Error('Fetched categories data is not a valid list');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch categories. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        // Update: always try database server request
        const updatedCat = await updateCategory(editingId, { name, description });
        setCategories(categories.map(cat => 
          cat.id === editingId ? updatedCat : cat
        ));
        setEditingId(null);
      } else {
        // Create: always try database server request
        const newCat = await createCategory({ name, description });
        setCategories([...categories, newCat]);
      }
      setName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Operation failed. Could not store category in database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat: CategoryDto) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this category? Any quizzes in this category will remain, but the category association might be broken.')) {
      return;
    }

    setError(null);
    try {
      await deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Manage Categories</h1>
          <p style={styles.subtitle}>Create, view, update, and delete categories for quizzes.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/quizzes/create')}>
          Back to Quiz Builder
        </button>
      </div>

      {error && (
        <div style={styles.alert}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-layout-1-2">
        {/* Left Side: Create/Edit Form */}
        <div className="glass-panel" style={styles.formPanel}>
          <div style={styles.panelHeader}>
            <FolderPlus size={20} color="#6366f1" />
            <h3>{editingId ? 'Edit Category' : 'Create Category'}</h3>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label htmlFor="cat-name">Category Name</label>
              <input
                id="cat-name"
                type="text"
                placeholder="e.g. Frontend Frameworks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cat-desc">Description (Optional)</label>
              <textarea
                id="cat-desc"
                placeholder="Briefly describe what this category evaluates."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={styles.formActions}>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  style={{ flex: 1 }}
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {submitting ? 'Submitting...' : editingId ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Categories List */}
        <div style={styles.listPanel}>
          {loading ? (
            <div style={styles.loader}>Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="glass-panel" style={styles.emptyBox}>
              <Folder size={48} color="#6b7280" />
              <h3>No categories found</h3>
              <p>Add your first category using the form on the left.</p>
            </div>
          ) : (
            <div className="grid-2-col">
              {Array.isArray(categories) && categories.map((cat) => (
                <div key={cat.id} className="glass-panel" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitleBox}>
                      <Folder size={18} color="#818cf8" />
                      <h4 style={styles.cardTitle}>{cat.name}</h4>
                    </div>
                    <div style={styles.cardActions}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(cat)}
                        style={styles.actionBtn}
                        title="Edit Category"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(cat.id)}
                        style={styles.deleteBtn}
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {cat.description ? (
                    <p style={styles.cardDesc}>{cat.description}</p>
                  ) : (
                    <p style={{ ...styles.cardDesc, fontStyle: 'italic', color: '#6b7280' }}>No description provided.</p>
                  )}
                  <div style={styles.cardFooter}>
                    <span style={styles.idBadge}>ID: {cat.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left' as const,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#9ca3af',
    marginTop: '0.25rem',
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    fontSize: '0.9rem',
    textAlign: 'left' as const,
  },
  formPanel: {
    padding: '1.5rem',
    textAlign: 'left' as const,
    position: 'sticky' as const,
    top: '90px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  listPanel: {
    flex: 1,
  },
  loader: {
    padding: '4rem',
    textAlign: 'center' as const,
    color: '#9ca3af',
  },
  emptyBox: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.75rem',
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    gap: '0.75rem',
    textAlign: 'left' as const,
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardTitleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#fff',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardActions: {
    display: 'flex',
    gap: '0.35rem',
  },
  actionBtn: {
    padding: '0.4rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  deleteBtn: {
    padding: '0.4rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    flex: 1,
  },
  cardFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '0.75rem',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  idBadge: {
    fontSize: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    color: '#6b7280',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    fontFamily: 'var(--font-mono)',
  },
};
