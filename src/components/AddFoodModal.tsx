import React, { useState, useMemo } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { useNutritionLogStore } from '../store/useNutritionLogStore';
import { FoodItem, MealType } from '../types';
import { foodDatabase, foodCategories, mealNames } from '../data/foodDatabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, ChevronRight, Star, Clock, Database, User, Store } from 'lucide-react';

type TabType = 'recent' | 'search' | 'custom';

interface AddFoodModalProps {
  onClose: () => void;
  onSelect: (food: FoodItem, grams: number) => void;
  mealType: MealType | null;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({ onClose, onSelect, mealType }) => {
  const { theme } = useThemeStore();
  const { customFoods, recentFoods, addToRecentFoods } = useNutritionLogStore();
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Marcas de supermercados
  const supermarketBrands = [
    { id: 'hacendado', name: 'Hacendado', color: 'bg-green-500' },
    { id: 'milbona', name: 'Milbona', color: 'bg-yellow-500' },
    { id: 'lidl', name: 'Lidl', color: 'bg-blue-500' },
    { id: 'hiperdino', name: 'HiperDino', color: 'bg-red-500' },
  ];

  // Filtrar alimentos según la pestaña activa
  const filteredFoods = useMemo(() => {
    if (activeTab === 'recent') {
      return recentFoods;
    }

    if (activeTab === 'custom') {
      let foods = customFoods;
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        foods = foods.filter((f) => f.name.toLowerCase().includes(searchLower));
      }
      return foods;
    }

    // Tab 'search' - buscar en la base de datos
    let foods = foodDatabase;

    if (selectedBrand) {
      foods = foods.filter((f) => f.brand?.toLowerCase().includes(selectedBrand.toLowerCase()));
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      foods = foods.filter(
        (f) =>
          f.name.toLowerCase().includes(searchLower) ||
          f.brand?.toLowerCase().includes(searchLower)
      );
    }

    return foods;
  }, [activeTab, recentFoods, customFoods, foodDatabase, selectedBrand, search]);

  // Calcular nutrientes para la cantidad seleccionada
  const calculatedNutrients = useMemo(() => {
    if (!selectedFood) return null;
    return {
      calories: Math.round((selectedFood.calories * grams) / 100),
      protein: Math.round((selectedFood.protein * grams) / 100 * 10) / 10,
      carbs: Math.round((selectedFood.carbs * grams) / 100 * 10) / 10,
      fat: Math.round((selectedFood.fat * grams) / 100 * 10) / 10,
    };
  }, [selectedFood, grams]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    addToRecentFoods(food);
  };

  const handleConfirm = () => {
    if (selectedFood) {
      onSelect(selectedFood, grams);
    }
  };

  const tabs = [
    { id: 'recent' as TabType, label: 'Recientes', icon: <Clock className="w-4 h-4" /> },
    { id: 'search' as TabType, label: 'Buscar', icon: <Database className="w-4 h-4" /> },
    { id: 'custom' as TabType, label: 'Mis Alimentos', icon: <User className="w-4 h-4" /> },
  ];

  // Vista de selección de cantidad
  if (selectedFood) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-md rounded-2xl p-6 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedFood(null)}
              className="text-theme-muted hover:text-theme-primary"
            >
              ← Volver
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50">
              <X className="w-5 h-5 text-theme-muted" />
            </button>
          </div>

          {/* Imagen y nombre */}
          <div className="flex items-center gap-4 mb-4">
            {selectedFood.image ? (
              <img
                src={selectedFood.image}
                alt={selectedFood.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${
                theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
              }`}>
                <span className="text-3xl">🍽️</span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-theme-primary">{selectedFood.name}</h3>
              {selectedFood.brand && (
                <p className="text-sm text-theme-muted">{selectedFood.brand}</p>
              )}
            </div>
          </div>

          {/* Cantidad */}
          <div className="mb-6">
            <label className="text-sm text-theme-muted">Cantidad (gramos)</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(Math.max(1, Number(e.target.value)))}
                className="flex-1 input-glass rounded-lg px-4 py-3 text-lg font-bold text-center"
              />
              <span className="text-theme-muted">g</span>
            </div>
            {/* Accesos rápidos */}
            <div className="flex gap-2 mt-2">
              {[25, 50, 100, 150, 200].map((g) => (
                <button
                  key={g}
                  onClick={() => setGrams(g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    grams === g
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {g}g
                </button>
              ))}
            </div>
          </div>

          {/* Nutrientes calculados */}
          {calculatedNutrients && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className={`p-3 rounded-xl text-center ${
                theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'
              }`}>
                <p className="text-xl font-bold text-red-400">{calculatedNutrients.calories}</p>
                <p className="text-xs text-theme-muted">kcal</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${
                theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <p className="text-xl font-bold text-blue-400">{calculatedNutrients.protein}g</p>
                <p className="text-xs text-theme-muted">Prot</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${
                theme === 'dark' ? 'bg-yellow-500/10' : 'bg-yellow-50'
              }`}>
                <p className="text-xl font-bold text-yellow-400">{calculatedNutrients.carbs}g</p>
                <p className="text-xs text-theme-muted">Carbs</p>
              </div>
              <div className={`p-3 rounded-xl text-center ${
                theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'
              }`}>
                <p className="text-xl font-bold text-orange-400">{calculatedNutrients.fat}g</p>
                <p className="text-xs text-theme-muted">Grasa</p>
              </div>
            </div>
          )}

          {/* Info por 100g */}
          <div className={`p-4 rounded-xl mb-6 ${
            theme === 'dark' ? 'bg-slate-700/30' : 'bg-slate-50'
          }`}>
            <p className="text-sm font-medium text-theme-secondary mb-2">Por 100g:</p>
            <div className="flex justify-between text-sm text-theme-muted">
              <span>{selectedFood.calories} kcal</span>
              <span>{selectedFood.protein}g prot</span>
              <span>{selectedFood.carbs}g carbs</span>
              <span>{selectedFood.fat}g grasa</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Añadir a {mealType ? mealNames[mealType] : 'la comida'}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Vista de búsqueda de alimentos
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full sm:max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 border-b border-theme bg-inherit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-theme-primary">
              Añadir alimento
            </h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50">
              <X className="w-5 h-5 text-theme-muted" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-700/30 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearch('');
                  setSelectedBrand(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-theme-muted hover:text-theme-primary'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Barra de búsqueda - solo en search y custom */}
          {(activeTab === 'search' || activeTab === 'custom') && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === 'custom' ? 'Buscar en mis alimentos...' : 'Buscar alimento o marca...'}
                className="w-full input-glass rounded-xl pl-10 pr-4 py-3"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Filtros de supermercado - solo en búsqueda */}
        {activeTab === 'search' && (
          <div className="px-4 py-3 border-b border-theme">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-4 h-4 text-theme-muted" />
              <span className="text-sm text-theme-muted">Supermercados:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedBrand(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  selectedBrand === null
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-200 text-slate-700'
                }`}
              >
                Todos
              </button>
              {supermarketBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    selectedBrand === brand.name
                      ? `${brand.color} text-white`
                      : theme === 'dark'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        )}


        {/* Lista de alimentos */}
        <div className="overflow-y-auto max-h-[50vh] p-4 pt-0">
          {/* Tab Recientes - mensaje vacío */}
          {activeTab === 'recent' && recentFoods.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-theme-muted mx-auto mb-3 opacity-50" />
              <p className="text-theme-muted">No hay alimentos recientes</p>
              <p className="text-sm text-theme-muted mt-1">
                Los alimentos que añadas aparecerán aquí
              </p>
            </div>
          )}

          {/* Tab Custom - mensaje vacío */}
          {activeTab === 'custom' && customFoods.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-theme-muted mx-auto mb-3 opacity-50" />
              <p className="text-theme-muted">No tienes alimentos personalizados</p>
              <button
                onClick={() => setShowCustomForm(true)}
                className="mt-4 text-blue-400 hover:underline"
              >
                + Crear tu primer alimento
              </button>
            </div>
          )}

          {/* Lista de alimentos */}
          {filteredFoods.length > 0 && (
            <div className="space-y-2">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 ${
                    theme === 'dark'
                      ? 'bg-slate-700/50 hover:bg-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {/* Imagen o emoji */}
                  {food.image ? (
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`text-xl flex-shrink-0 ${food.image ? 'hidden' : ''}`}>
                    {foodCategories[food.category]?.emoji || '🍽️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-theme-primary truncate">{food.name}</span>
                      {food.isCustom && (
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {food.brand && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          theme === 'dark' ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {food.brand}
                        </span>
                      )}
                      <span className="text-xs text-theme-muted">
                        {food.calories} kcal • {food.protein}p • {food.carbs}c • {food.fat}g
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-theme-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Sin resultados en búsqueda */}
          {activeTab === 'search' && filteredFoods.length === 0 && search.trim() && (
            <div className="text-center py-8">
              <p className="text-theme-muted">No se encontraron alimentos</p>
              <button
                onClick={() => setShowCustomForm(true)}
                className="mt-4 text-blue-400 hover:underline"
              >
                + Crear alimento personalizado
              </button>
            </div>
          )}
        </div>

        {/* Botón de crear personalizado */}
        <div className="p-4 border-t border-theme">
          <button
            onClick={() => setShowCustomForm(true)}
            className={`w-full p-4 rounded-xl border-2 border-dashed ${
              theme === 'dark'
                ? 'border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400'
                : 'border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-600'
            }`}
          >
            + Crear alimento personalizado
          </button>
        </div>
      </motion.div>

      {/* Modal de alimento personalizado */}
      <AnimatePresence>
        {showCustomForm && (
          <CustomFoodForm
            onClose={() => setShowCustomForm(false)}
            onCreated={(food) => {
              setShowCustomForm(false);
              handleSelectFood(food);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Formulario de alimento personalizado
const CustomFoodForm: React.FC<{
  onClose: () => void;
  onCreated: (food: FoodItem) => void;
}> = ({ onClose, onCreated }) => {
  const { theme } = useThemeStore();
  const { addCustomFood } = useNutritionLogStore();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    category: 'other' as FoodItem['category'],
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      brand: formData.brand || undefined,
      category: formData.category,
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fat: formData.fat,
      isCustom: true,
    };

    addCustomFood(formData);
    onCreated(newFood);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-theme-primary">Nuevo alimento</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50">
            <X className="w-5 h-5 text-theme-muted" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-theme-muted">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Mi batido proteico"
              className="w-full input-glass rounded-lg px-4 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-theme-muted">Marca (opcional)</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ej: Myprotein"
              className="w-full input-glass rounded-lg px-4 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-theme-muted">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as FoodItem['category'] })
              }
              className="w-full input-glass rounded-lg px-4 py-2 mt-1"
            >
              {Object.entries(foodCategories).map(([key, { name, emoji }]) => (
                <option key={key} value={key}>
                  {emoji} {name}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-theme-muted font-medium">Valores por 100g:</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-theme-muted">Calorías</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                className="w-full input-glass rounded-lg px-4 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-theme-muted">Proteína (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                className="w-full input-glass rounded-lg px-4 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-theme-muted">Carbohidratos (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                className="w-full input-glass rounded-lg px-4 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-theme-muted">Grasas (g)</label>
              <input
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                className="w-full input-glass rounded-lg px-4 py-2 mt-1"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim()}
          className={`w-full mt-6 py-3 rounded-xl font-semibold ${
            formData.name.trim()
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }`}
        >
          Crear Alimento
        </button>
      </motion.div>
    </motion.div>
  );
};
