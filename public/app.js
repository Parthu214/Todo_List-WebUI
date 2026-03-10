const apiBase = '/api/tasks';

const state = {
  tasks: [],
  editingTask: null,
  notified: new Set(JSON.parse(localStorage.getItem('notifiedTasks') || '[]'))
};

const elements = {
  pendingList: document.getElementById('pendingList'),
  completedList: document.getElementById('completedList'),
  pendingCount: document.getElementById('pendingCount'),
  completedCount: document.getElementById('completedCount'),
  showNewTask: document.getElementById('showNewTask'),
  taskModal: document.getElementById('taskModal'),
  closeModal: document.getElementById('closeModal'),
  taskForm: document.getElementById('taskForm'),
  modalTitle: document.getElementById('modalTitle'),
  title: document.getElementById('title'),
  description: document.getElementById('description'),
  dueDate: document.getElementById('dueDate'),
  reminder: document.getElementById('reminder'),
  subtaskInput: document.getElementById('subtaskInput'),
  subtaskList: document.getElementById('subtaskList'),
  cancelTask: document.getElementById('cancelTask'),
  toast: document.getElementById('toast'),
  themeToggle: document.getElementById('themeToggle')
};

const createToast = (text) => {
  elements.toast.textContent = text;
  elements.toast.classList.add('show');
  window.clearTimeout(elements.toast.timeout);
  elements.toast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3500);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchTasks = async () => {
  try {
    const res = await fetch(apiBase);
    const tasks = await res.json();
    state.tasks = tasks;
    renderTasks();
  } catch (error) {
    console.error('Fetch tasks failed', error);
    createToast('Failed to load tasks');
  }
};

const saveTask = async (payload) => {
  const url = state.editingTask ? `${apiBase}/${state.editingTask._id}` : apiBase;
  const method = state.editingTask ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
};

const deleteTask = async (id) => {
  await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
};

const resetForm = () => {
  state.editingTask = null;
  elements.taskForm.reset();
  elements.subtaskList.innerHTML = '';
  elements.modalTitle.textContent = 'New Task';
};

const openModal = (task = null) => {
  state.editingTask = task;
  resetForm();

  if (task) {
    elements.modalTitle.textContent = 'Edit Task';
    elements.title.value = task.title;
    elements.description.value = task.description || '';
    elements.dueDate.value = task.dueDate ? task.dueDate.slice(0, 16) : '';
    elements.reminder.value = task.reminder ? task.reminder.slice(0, 16) : '';
    task.subtasks?.forEach((sub) => addSubtaskRow(sub.title, sub.completed));
  }

  elements.taskModal.classList.add('open');
  elements.taskModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => elements.title.focus(), 200);
};

const closeModal = () => {
  elements.taskModal.classList.remove('open');
  elements.taskModal.setAttribute('aria-hidden', 'true');
  resetForm();
};

const readSubtasks = () => {
  return Array.from(elements.subtaskList.querySelectorAll('li')).map((li) => ({
    title: li.dataset.title,
    completed: li.querySelector('input[type=checkbox]').checked
  }));
};

const addSubtaskRow = (value = '', completed = false) => {
  const li = document.createElement('li');
  li.dataset.title = value;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = completed;

  const span = document.createElement('span');
  span.textContent = value;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.innerHTML = '<i class="fa-solid fa-trash"></i>';
  remove.title = 'Remove subtask';

  remove.addEventListener('click', () => {
    li.remove();
  });

  li.append(checkbox, span, remove);
  elements.subtaskList.appendChild(li);
};

const handleSubtaskInput = (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  const value = elements.subtaskInput.value.trim();
  if (!value) return;
  addSubtaskRow(value);
  elements.subtaskInput.value = '';
};

const getProgressPercent = (task) => {
  const total = task.subtasks?.length || 0;
  if (!total) return task.status === 'completed' ? 100 : 0;
  const done = task.subtasks.filter((s) => s.completed).length;
  return Math.round((done / total) * 100);
};

const buildTaskCard = (task) => {
  const card = document.createElement('article');
  card.className = 'card';
  if (task.status === 'completed') card.classList.add('completed');

  const header = document.createElement('div');
  header.className = 'card-header';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = task.title;

  const actionGroup = document.createElement('div');
  actionGroup.className = 'card-actions';

  const markBtn = document.createElement('button');
  markBtn.className = 'btn icon-btn';
  markBtn.title = task.status === 'completed' ? 'Mark as pending' : 'Mark as completed';
  markBtn.innerHTML = task.status === 'completed' ? '<i class="fa-solid fa-rotate-left"></i>' : '<i class="fa-solid fa-check"></i>';
  markBtn.addEventListener('click', async () => {
    await saveTask({ ...task, status: task.status === 'completed' ? 'pending' : 'completed' });
    await fetchTasks();
  });

  const editBtn = document.createElement('button');
  editBtn.className = 'btn icon-btn';
  editBtn.title = 'Edit task';
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  editBtn.addEventListener('click', () => openModal(task));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn icon-btn';
  deleteBtn.title = 'Delete task';
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(task._id);
    createToast('Task deleted');
    await fetchTasks();
  });

  actionGroup.append(markBtn, editBtn, deleteBtn);
  header.append(title, actionGroup);

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const due = document.createElement('span');
  due.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formatDate(task.dueDate)}`;

  const reminder = document.createElement('span');
  reminder.innerHTML = `<i class="fa-regular fa-bell"></i> ${formatDate(task.reminder)}`;

  const status = document.createElement('span');
  status.innerHTML = `<i class="fa-solid fa-circle" style="color:${task.status === 'completed' ? '#3de6f6' : '#7e5bef'}"></i> ${task.status}`;

  meta.append(due, reminder, status);

  const description = document.createElement('p');
  description.className = 'description';
  description.textContent = task.description || '';

  const progress = document.createElement('div');
  progress.className = 'progress';
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  const pct = getProgressPercent(task);
  bar.style.width = `${pct}%`;
  progress.append(bar);

  const progressLabel = document.createElement('div');
  progressLabel.className = 'task-meta';
  progressLabel.innerHTML = `<span><i class="fa-solid fa-list-check"></i> ${pct}% subtasks done</span>`;

  card.append(header, description, meta, progress, progressLabel);

  if (task.subtasks && task.subtasks.length) {
    const subtasks = document.createElement('ul');
    subtasks.className = 'subtasks';

    task.subtasks.forEach((sub, index) => {
      const li = document.createElement('li');
      if (sub.completed) li.classList.add('completed');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = sub.completed;
      checkbox.addEventListener('change', async () => {
        task.subtasks[index].completed = checkbox.checked;
        if (task.subtasks.every((v) => v.completed)) task.status = 'completed';
        else if (task.status === 'completed') task.status = 'pending';
        await saveTask(task);
        await fetchTasks();
      });

      const label = document.createElement('span');
      label.textContent = sub.title;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      remove.addEventListener('click', async () => {
        task.subtasks.splice(index, 1);
        await saveTask(task);
        await fetchTasks();
      });

      li.append(checkbox, label, remove);
      subtasks.appendChild(li);
    });

    card.append(subtasks);
  }

  return card;
};

const renderTasks = () => {
  const pending = state.tasks.filter((t) => t.status !== 'completed');
  const completed = state.tasks.filter((t) => t.status === 'completed');

  elements.pendingList.innerHTML = '';
  elements.completedList.innerHTML = '';

  pending.forEach((task) => elements.pendingList.appendChild(buildTaskCard(task)));
  completed.forEach((task) => elements.completedList.appendChild(buildTaskCard(task)));

  elements.pendingCount.textContent = pending.length;
  elements.completedCount.textContent = completed.length;
};

const handleFormSubmit = async (event) => {
  event.preventDefault();
  const payload = {
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
    dueDate: elements.dueDate.value ? new Date(elements.dueDate.value).toISOString() : null,
    reminder: elements.reminder.value ? new Date(elements.reminder.value).toISOString() : null,
    status: state.editingTask ? state.editingTask.status : 'pending',
    subtasks: readSubtasks().filter((s) => s.title.trim())
  };

  if (!payload.title) {
    createToast('Title is required');
    return;
  }

  await saveTask(payload);
  createToast(state.editingTask ? 'Task updated' : 'Task created');
  await fetchTasks();
  closeModal();
};

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

const checkReminders = () => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const now = Date.now();
  state.tasks.forEach((task) => {
    if (task.status === 'completed') return;
    if (!task.reminder) return;
    const reminderTime = new Date(task.reminder).getTime();
    if (reminderTime <= now && !state.notified.has(task._id)) {
      state.notified.add(task._id);
      localStorage.setItem('notifiedTasks', JSON.stringify(Array.from(state.notified)));
      new Notification(task.title, {
        body: task.description || 'Reminder for your task'
      });
      createToast(`Reminder: ${task.title}`);
    }
  });
};

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const icon = theme === 'dark' ? '<i class="fa-regular fa-moon"></i>' : '<i class="fa-regular fa-sun"></i>';
  elements.themeToggle.innerHTML = icon;
};

const initTheme = () => {
  const stored = localStorage.getItem('theme');
  const defaultTheme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(defaultTheme);
};

const init = async () => {
  initTheme();
  await requestNotificationPermission();
  await fetchTasks();
  setInterval(checkReminders, 30_000);
};

// --- Event Listeners ---

elements.showNewTask.addEventListener('click', () => openModal());

elements.closeModal.addEventListener('click', closeModal);

elements.cancelTask.addEventListener('click', (event) => {
  event.preventDefault();
  closeModal();
});

elements.taskModal.addEventListener('click', (event) => {
  if (event.target === elements.taskModal || event.target.classList.contains('modal-backdrop')) {
    closeModal();
  }
});

elements.subtaskInput.addEventListener('keydown', handleSubtaskInput);

elements.taskForm.addEventListener('submit', handleFormSubmit);

elements.themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && elements.taskModal.classList.contains('open')) {
    closeModal();
  }
});

init();
