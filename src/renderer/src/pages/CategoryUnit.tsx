import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Category, Unit, CategoryFormData, UnitFormData } from '../types/categoryUnit';
import CategoryUnitHeader from '../components/categoryUnit/CategoryUnitHeader';
import CategoryUnitTabs from '../components/categoryUnit/CategoryUnitTabs';
import CategoriesTable from '../components/categoryUnit/CategoriesTable';
import UnitsTable from '../components/categoryUnit/UnitsTable';
import CategoryFormModal from '../components/categoryUnit/CategoryFormModal';
import UnitFormModal from '../components/categoryUnit/UnitFormModal';

export default function CategoryUnit() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'categories' | 'units'>('categories');
  const [loading, setLoading] = useState(true);

  // Pagination state (shared between both tabs)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    description: ''
  });

  // Units state
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitSearchTerm, setUnitSearchTerm] = useState('');
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitFormData, setUnitFormData] = useState<UnitFormData>({
    name: '',
    abbreviation: '',
    type: 'base',
    description: ''
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, unitsData] = await Promise.all([
        window.api.categories.getAll(),
        window.api.units.getAll()
      ]);
      setCategories(categoriesData);
      setUnits(unitsData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: '', description: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        await window.api.categories.update(editingCategory.id.toString(), categoryFormData);
        toast.success('Category updated successfully');
      } else {
        await window.api.categories.create(categoryFormData);
        toast.success('Category added successfully');
      }
      setShowCategoryModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save category');
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await window.api.categories.delete(id.toString());
        toast.success('Category deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete category');
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', description: '' });
  };

  // Unit handlers
  const handleAddUnit = () => {
    setEditingUnit(null);
    setUnitFormData({ name: '', abbreviation: '', type: 'base', description: '' });
    setShowUnitModal(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitFormData({
      name: unit.name,
      abbreviation: unit.abbreviation,
      type: unit.type,
      description: unit.description
    });
    setShowUnitModal(true);
  };

  const handleUnitSubmit = async () => {
    try {
      if (editingUnit) {
        await window.api.units.update(editingUnit.id.toString(), unitFormData);
        toast.success('Unit updated successfully');
      } else {
        await window.api.units.create(unitFormData);
        toast.success('Unit added successfully');
      }
      setShowUnitModal(false);
      loadData();
    } catch (error) {
      toast.error('Failed to save unit');
      console.error('Error saving unit:', error);
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await window.api.units.delete(id.toString());
        toast.success('Unit deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Failed to delete unit');
        console.error('Error deleting unit:', error);
      }
    }
  };

  const handleCloseUnitModal = () => {
    setShowUnitModal(false);
    setEditingUnit(null);
    setUnitFormData({ name: '', abbreviation: '', type: 'base', description: '' });
  };

  // Handle tab change - reset pagination
  const handleTabChange = (tab: 'categories' | 'units') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <CategoryUnitHeader />
      <CategoryUnitTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'categories' ? (
        <CategoriesTable
          categories={categories}
          searchTerm={categorySearchTerm}
          onSearchChange={setCategorySearchTerm}
          onAddClick={handleAddCategory}
          onEditClick={handleEditCategory}
          onDeleteClick={handleDeleteCategory}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      ) : (
        <UnitsTable
          units={units}
          searchTerm={unitSearchTerm}
          onSearchChange={setUnitSearchTerm}
          onAddClick={handleAddUnit}
          onEditClick={handleEditUnit}
          onDeleteClick={handleDeleteUnit}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={handleCloseCategoryModal}
        category={editingCategory}
        formData={categoryFormData}
        onFormDataChange={setCategoryFormData}
        onSubmit={handleCategorySubmit}
      />

      <UnitFormModal
        isOpen={showUnitModal}
        onClose={handleCloseUnitModal}
        unit={editingUnit}
        formData={unitFormData}
        onFormDataChange={setUnitFormData}
        onSubmit={handleUnitSubmit}
      />
    </div>
  );
}
