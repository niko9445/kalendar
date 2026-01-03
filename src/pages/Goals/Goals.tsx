import React, { useState, useMemo } from 'react';
import Header from '../../components/Navigation/Header';
import BottomNav from '../../components/Navigation/BottomNav';
import GoalItemCompact from './components/GoalItemCompact';
import AddGoalModal from './components/AddGoalModal';
import { useGoals } from '../../contexts/GoalsContext';
import { useTranslation } from '../../i18n/hooks';
import { GoalInsert } from '../../types/database.types';
import { getCategoryKey } from '../../constants/categories';

const Goals: React.FC = () => {
  const {
    goals,
    events,
    addGoal,
    toggleGoalComplete,
    addEvent,
    deleteEvent,
    toggleEventComplete,
    getEventsByGoal,
    deleteGoal,
    goalsWithCategories,
  } = useGoals();

  const { t, goals: goalsT } = useTranslation();
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const handleAddGoal = (formData: {
    title: string;
    description: string;
    category: string;
    startDate: string;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
  }) => {
    const goalData: Omit<GoalInsert, 'user_id' | 'progress' | 'completed' | 'is_expanded'> = {
      title: formData.title,
      description: formData.description,
      custom_category: formData.category,
      start_date: formData.startDate,
      deadline: formData.deadline,
      priority: formData.priority,
      category_id: null, // TODO: Найти ID категории по имени
    };

    addGoal(goalData);
  };

  const handleEventSave = (eventData: any) => {
    // Преобразуем данные из формы в формат базы данных
    const formattedEvent = {
      goal_id: eventData.goalId,
      title: eventData.title,
      description: eventData.description || '',
      date: eventData.date,
      color: eventData.color,
      event_type: eventData.type || 'work',
      completed: eventData.completed || false,
      amount: eventData.amount || null,
      currency: eventData.currency || 'RUB',
      is_completion_day: eventData.type === 'completion',
      completion_day_id: eventData.type === 'completion' ? `completion-${eventData.goalId}-${eventData.date}` : null,
    };

    addEvent(formattedEvent);
  };

  const handleEventDelete = (eventId: string) => {
    deleteEvent(eventId);
  };

  const handleEventToggleComplete = (eventId: string) => {
    toggleEventComplete(eventId);
  };

  const handleGoalToggleComplete = (goalId: string) => {
    toggleGoalComplete(goalId);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
  };

  // Преобразуем цели для компонентов
  const transformedGoals = useMemo(() => {
    return goalsWithCategories.map(goal => {
      const categoryText = goal.custom_category || goal.category?.name_ru || '';
      const categoryKey = getCategoryKey(categoryText, t);
      
      return {
        id: goal.id,
        title: goal.title,
        description: goal.description || '',
        category: categoryText, // Переведенная категория для отображения
        categoryKey: categoryKey, // Ключ категории для логики
        progress: goal.progress,
        startDate: goal.start_date,
        deadline: goal.deadline,
        priority: goal.priority,
        completed: goal.completed,
        isExpanded: goal.is_expanded,
      };
    });
  }, [goalsWithCategories, t]);

  // Преобразуем события для компонентов
  const transformedEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      goalId: event.goal_id,
      title: event.title,
      description: event.description || '',
      date: event.date,
      color: event.color,
      type: event.event_type,
      completed: event.completed,
      amount: event.amount || undefined,
      currency: event.currency || undefined,
      isCompletionDay: event.is_completion_day || undefined,
      completionDayId: event.completion_day_id || undefined,
    }));
  }, [events]);

  const completedGoals = goals.filter(g => g.completed).length;
  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)
    : 0;

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-20 transition-colors duration-200">
      {/* Шапка с кнопкой добавления */}
      <Header 
        title={goalsT('title')}
        subtitle={t('goals.activeGoals', { count: goals.length })}
        rightAction={
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface dark:hover:bg-dark-surface active:bg-border dark:active:bg-dark-border transition-colors"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <svg 
              className="w-5 h-5 text-text-primary dark:text-dark-text-primary" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        }
      />

      <main className="p-4">
        {/* Компактная статистика */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 card p-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary dark:bg-dark-primary rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  {goalsT('completed')}
                </p>
                <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                  {t('goals.goalsCount', { count: completedGoals })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 card p-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary dark:bg-dark-primary rounded-lg flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                  {goalsT('progress')}
                </p>
                <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                  {t('goals.percentage', { value: totalProgress })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Список целей с раскрывающимися календарями */}
        <div className="space-y-2">
          {transformedGoals.map((goal) => (
            <GoalItemCompact
              key={goal.id}
              goal={goal}
              events={transformedEvents.filter(event => event.goalId === goal.id)}
              isExpanded={expandedGoalId === goal.id}
              onToggleExpand={() => toggleGoalExpansion(goal.id)}
              onToggleComplete={() => handleGoalToggleComplete(goal.id)}
              onDeleteGoal={() => handleDeleteGoal(goal.id)}
              onEventSave={handleEventSave}
              onEventDelete={handleEventDelete}
              onEventToggleComplete={handleEventToggleComplete}
            />
          ))}
        </div>

        {/* Пустое состояние */}
        {transformedGoals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-text-secondary dark:text-dark-text-secondary" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-2">
              {goalsT('noGoals')}
            </h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">
              {goalsT('addFirstGoal')}
            </p>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="px-6 py-3 bg-primary dark:bg-dark-primary text-white rounded-lg hover:bg-primary-dark dark:hover:bg-dark-primary-dark transition-colors"
            >
              {goalsT('createGoal')}
            </button>
          </div>
        )}
      </main>

      {/* Модалка добавления цели */}
      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        onSave={handleAddGoal}
      />

      <BottomNav />
    </div>
  );
};

export default Goals;