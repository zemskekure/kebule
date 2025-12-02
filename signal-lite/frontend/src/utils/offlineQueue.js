import { sendSignal } from './api';

const QUEUE_KEY = 'signal_lite_queue';

export function queueSignal(signalData) {
  try {
    const queue = getQueue();
    queue.push({
      ...signalData,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('Signal queued for later:', signalData.title);
  } catch (error) {
    console.error('Failed to queue signal:', error);
  }
}

export function getQueue() {
  try {
    const queueJson = localStorage.getItem(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Failed to get queue:', error);
    return [];
  }
}

export function clearQueue() {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Failed to clear queue:', error);
  }
}

export async function processOfflineQueue(token) {
  if (!navigator.onLine) {
    console.log('Still offline, skipping queue processing');
    return;
  }

  const queue = getQueue();
  if (queue.length === 0) {
    return;
  }

  console.log(`Processing ${queue.length} queued signals...`);

  const failedSignals = [];

  for (const signal of queue) {
    try {
      // Remove queuedAt before sending
      const { queuedAt, ...signalData } = signal;
      await sendSignal(signalData, token);
      console.log('Queued signal sent:', signalData.title);
    } catch (error) {
      console.error('Failed to send queued signal:', error);
      failedSignals.push(signal);
    }
  }

  // Update queue with only failed signals
  if (failedSignals.length > 0) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failedSignals));
    console.log(`${failedSignals.length} signals remain in queue`);
  } else {
    clearQueue();
    console.log('All queued signals sent successfully');
  }
}
