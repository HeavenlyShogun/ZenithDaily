import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Check, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { 
  getTasksWithSubTasks, 
  insertTask, 
  insertSubTask, 
  updateTaskCompletion, 
  updateSubTaskCompletion, 
  updateAllSubTasksCompletion, 
  deleteTask,
  TaskWithSubtasks 
} from '../database/db';

export default function TodoScreen() {
  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newSubTaskTitles, setNewSubTaskTitles] = useState<{ [key: string]: string }>({});

  // 載入資料庫中的任務
  const loadTasks = async () => {
    try {
      const data = await getTasksWithSubTasks();
      
      // 首次安裝若無資料，預置精美的學業/健康/生活範例
      if (data.length === 0) {
        const t1Id = 'sample-1';
        await insertTask(t1Id, '準備物理段考 Ch.3', 'study');
        await insertSubTask('sample-1-1', t1Id, '讀熟課本第三章觀念 (30分鐘)', true);
        await insertSubTask('sample-1-2', t1Id, '寫完課後練習題 5 題 (20分鐘)', false);
        await insertSubTask('sample-1-3', t1Id, '整理自己的公式錯題卡 (15分鐘)', false);

        const t2Id = 'sample-2';
        await insertTask(t2Id, '放學後在操場慢跑 15 分鐘', 'health', true);

        const t3Id = 'sample-3';
        await insertTask(t3Id, '背完英文 L5 單字 (20個)', 'study', true);

        const t4Id = 'sample-4';
        await insertTask(t4Id, '整理書桌與書包準備明天用品', 'life', false);

        const freshData = await getTasksWithSubTasks();
        // 預設將第一個複雜任務展開
        if (freshData.length > 0) {
          freshData[0].isExpanded = true;
        }
        setTasks(freshData);
      } else {
        setTasks(data);
      }
    } catch (error) {
      console.error('無法讀取任務列表:', error);
    } finally {
      setLoading(false);
    }
  };

  // 每次切換回此分頁時自動重新整理資料
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  // 切換大任務完成狀態
  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const nextCompleted = !task.isCompleted;

    // 樂觀更新 UI 狀態
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          isCompleted: nextCompleted,
          subTasks: t.subTasks.map(sub => ({ ...sub, isCompleted: nextCompleted }))
        };
      }
      return t;
    }));

    try {
      await updateTaskCompletion(taskId, nextCompleted);
      if (task.subTasks.length > 0) {
        await updateAllSubTasksCompletion(taskId, nextCompleted);
      }
    } catch (error) {
      console.error('更新大任務狀態失敗:', error);
      loadTasks(); // 失敗時從資料庫載入舊狀態進行回滾
    }
  };

  // 切換子任務完成狀態
  const toggleSubTask = async (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const sub = task.subTasks.find(s => s.id === subTaskId);
    if (!sub) return;
    const nextSubCompleted = !sub.isCompleted;

    // 樂觀更新 UI 狀態
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubTasks = t.subTasks.map(s => 
          s.id === subTaskId ? { ...s, isCompleted: nextSubCompleted } : s
        );
        const allCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(s => s.isCompleted);
        return { ...t, subTasks: updatedSubTasks, isCompleted: allCompleted };
      }
      return t;
    }));

    try {
      await updateSubTaskCompletion(subTaskId, nextSubCompleted);
      
      const updatedSubTasks = task.subTasks.map(s => 
        s.id === subTaskId ? { ...s, isCompleted: nextSubCompleted } : s
      );
      const allCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(s => s.isCompleted);
      if (allCompleted !== task.isCompleted) {
        await updateTaskCompletion(taskId, allCompleted);
      }
    } catch (error) {
      console.error('更新子任務狀態失敗:', error);
      loadTasks();
    }
  };

  // 切換展開/收合
  const toggleExpand = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isExpanded: !t.isExpanded } : t));
  };

  // 新增大任務（支援前綴標籤如 [生活]、[健康]，未加時預設為學業）
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    let title = newTaskTitle.trim();
    let category: 'study' | 'life' | 'health' = 'study';

    if (title.startsWith('[生活]')) {
      category = 'life';
      title = title.substring(4).trim();
    } else if (title.startsWith('[健康]')) {
      category = 'health';
      title = title.substring(4).trim();
    } else if (title.startsWith('[學業]')) {
      category = 'study';
      title = title.substring(4).trim();
    }

    const newId = Date.now().toString();

    // 樂觀新增
    const newTaskItem: TaskWithSubtasks = {
      id: newId,
      title,
      category,
      isCompleted: false,
      subTasks: [],
    };

    setTasks(prev => [newTaskItem, ...prev]);
    setNewTaskTitle('');

    try {
      await insertTask(newId, title, category);
    } catch (error) {
      console.error('新增任務失敗:', error);
      loadTasks();
    }
  };

  // 於特定任務下新增子任務
  const handleAddSubTask = async (taskId: string) => {
    const subTitle = newSubTaskTitles[taskId]?.trim();
    if (!subTitle) return;

    const subId = Date.now().toString();

    // 樂觀更新子任務列表與父任務狀態
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          isCompleted: false, // 新增待辦子任務後，大任務設為未完成
          subTasks: [...t.subTasks, { id: subId, title: subTitle, isCompleted: false }]
        };
      }
      return t;
    }));

    setNewSubTaskTitles(prev => ({ ...prev, [taskId]: '' }));

    try {
      await insertSubTask(subId, taskId, subTitle);
      await updateTaskCompletion(taskId, false);
    } catch (error) {
      console.error('新增子任務失敗:', error);
      loadTasks();
    }
  };

  // 刪除大任務
  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('刪除任務失敗:', error);
      loadTasks();
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'study': return '📚 學業';
      case 'health': return '🏃‍♂️ 健康';
      case 'life': return '🏠 生活';
      default: return '📝 其他';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 頂部標題 */}
          <View style={styles.header}>
            <Text style={styles.title}>智慧待辦清單</Text>
            <Text style={styles.subtitle}>「把任務拆成微小步驟，拖延症自然就會消退。」</Text>
          </View>

          {/* 新增任務區塊 */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="新增任務... 輸入 [生活] 讀小說, [健康] 喝水"
              placeholderTextColor={Colors.textMuted}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={handleAddTask}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTask} activeOpacity={0.8}>
              <Plus size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* 任務清單載入中狀態 */}
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
              <Text style={styles.sectionTitle}>今日任務列表</Text>
              {tasks.length === 0 ? (
                <Text style={styles.emptyText}>目前沒有任務，寫下你的第一個自律計畫吧！</Text>
              ) : (
                tasks.map(task => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      {/* 大任務勾選圈圈 */}
                      <TouchableOpacity 
                        style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]} 
                        onPress={() => toggleTask(task.id)}
                        activeOpacity={0.7}
                      >
                        {task.isCompleted && <Check size={12} color="#FFF" />}
                      </TouchableOpacity>

                      {/* 任務名稱與標籤 */}
                      <View style={styles.taskMeta}>
                        <Text style={[styles.taskTitleText, task.isCompleted && styles.textCompleted]}>
                          {task.title}
                        </Text>
                        <View style={styles.badgeRow}>
                          <Text style={styles.categoryBadge}>{getCategoryLabel(task.category)}</Text>
                          {task.subTasks.length > 0 && (
                            <Text style={styles.subtaskCount}>
                              子任務 {task.subTasks.filter(s => s.isCompleted).length}/{task.subTasks.length}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* 操作按鈕 */}
                      <View style={styles.actionRow}>
                        {/* 展開摺疊子任務 */}
                        <TouchableOpacity onPress={() => toggleExpand(task.id)} style={styles.actionBtn}>
                          {task.isExpanded ? <ChevronUp size={20} color={Colors.textMuted} /> : <ChevronDown size={20} color={Colors.textMuted} />}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteTask(task.id)} style={styles.actionBtn}>
                          <Trash2 size={16} color={Colors.warning} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* 階梯式子任務清單 */}
                    {task.isExpanded && (
                      <View style={styles.subtasksContainer}>
                        <View style={styles.subtaskTimelineLine} />
                        {task.subTasks.map(sub => (
                          <View key={sub.id} style={styles.subtaskRow}>
                            <TouchableOpacity 
                              style={[styles.subCheckbox, sub.isCompleted && styles.subCheckboxChecked]}
                              onPress={() => toggleSubTask(task.id, sub.id)}
                              activeOpacity={0.7}
                            >
                              {sub.isCompleted && <Check size={10} color="#FFF" />}
                            </TouchableOpacity>
                            <Text style={[styles.subtaskText, sub.isCompleted && styles.textCompleted]}>
                              {sub.title}
                            </Text>
                          </View>
                        ))}

                        {/* 新增子任務的微型輸入框 */}
                        <View style={styles.subtaskInputRow}>
                          <TextInput
                            style={styles.subtaskInput}
                            placeholder="新增子任務步驟..."
                            placeholderTextColor={Colors.textMuted}
                            value={newSubTaskTitles[task.id] || ''}
                            onChangeText={(txt) => setNewSubTaskTitles(prev => ({ ...prev, [task.id]: txt }))}
                            onSubmitEditing={() => handleAddSubTask(task.id)}
                          />
                          <TouchableOpacity 
                            style={styles.subtaskAddBtn} 
                            onPress={() => handleAddSubTask(task.id)}
                            activeOpacity={0.8}
                          >
                            <Plus size={12} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  inputCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  taskMeta: {
    flex: 1,
  },
  taskTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    fontSize: 11,
    color: Colors.textMuted,
    backgroundColor: '#EBF2EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  subtaskCount: {
    fontSize: 11,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 6,
    marginLeft: 4,
  },
  subtasksContainer: {
    marginTop: 12,
    paddingLeft: 30,
    position: 'relative',
  },
  subtaskTimelineLine: {
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 36, // 留下底部輸入框對齊的空間
    width: 2,
    backgroundColor: Colors.border,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  subCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  subCheckboxChecked: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  subtaskText: {
    fontSize: 13,
    color: Colors.text,
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingRight: 10,
  },
  subtaskInput: {
    flex: 1,
    height: 32,
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subtaskAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
