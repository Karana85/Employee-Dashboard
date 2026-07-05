const KEY_PHRASES = [
  'effective', 'required', 'deadline', 'must', 'please', 'all employees',
  'save the date', 'join us', 'update', 'new policy', 'training',
];

function extractKeySentences(content, maxSentences = 3) {
  const sentences = content
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .filter((s) => s.trim().length > 20);

  const scored = sentences.map((sentence) => {
    const lower = sentence.toLowerCase();
    let score = 0;
    KEY_PHRASES.forEach((phrase) => {
      if (lower.includes(phrase)) score += 2;
    });
    if (/\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(sentence)) {
      score += 3;
    }
    if (/\d{1,2}:\d{2}/.test(sentence)) score += 2;
    if (/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i.test(sentence)) {
      score += 3;
    }
    if (sentence.length < 80) score += 1;
    return { sentence: sentence.trim(), score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map((s) => s.sentence);
}

function extractActionItems(content) {
  const actions = [];
  const patterns = [
    /please\s+([^.!?]+)/gi,
    /must\s+([^.!?]+)/gi,
    /required\s+(?:to\s+)?([^.!?]+)/gi,
    /rsvp\s+([^.!?]+)/gi,
    /submit\s+([^.!?]+)/gi,
    /complete\s+([^.!?]+)/gi,
    /acknowledge\s+([^.!?]+)/gi,
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const action = match[0].trim();
      if (action.length > 10 && action.length < 120) {
        actions.push(action.charAt(0).toUpperCase() + action.slice(1));
      }
    }
  });

  return [...new Set(actions)].slice(0, 3);
}

function detectPriority(content, existingPriority) {
  const urgentWords = ['required', 'must', 'deadline', 'mandatory', 'urgent'];
  const lower = content.toLowerCase();
  const urgentCount = urgentWords.filter((w) => lower.includes(w)).length;
  if (urgentCount >= 2) return 'high';
  if (urgentCount === 1) return 'medium';
  return existingPriority;
}

export async function summarizeAnnouncement(announcement) {
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

  const keyPoints = extractKeySentences(announcement.content);
  const actionItems = extractActionItems(announcement.content);
  const suggestedPriority = detectPriority(announcement.content, announcement.priority);

  const wordCount = announcement.content.split(/\s+/).length;
  const summaryWordCount = keyPoints.join(' ').split(/\s+/).length;
  const compressionRatio = Math.round((1 - summaryWordCount / wordCount) * 100);

  return {
    summary: keyPoints.join(' '),
    keyPoints,
    actionItems,
    suggestedPriority,
    metadata: {
      originalWordCount: wordCount,
      summaryWordCount,
      compressionRatio: `${compressionRatio}% shorter`,
      processingTime: `${(1.2 + Math.random() * 0.8).toFixed(1)}s`,
    },
  };
}

export async function summarizeAllAnnouncements(announcements) {
  const summaries = await Promise.all(
    announcements.map(async (ann) => ({
      id: ann.id,
      title: ann.title,
      ...(await summarizeAnnouncement(ann)),
    }))
  );
  return summaries;
}

const CHAT_RESPONSES = [
  {
    keywords: ['leave', 'vacation', 'pto', 'time off', 'holiday'],
    getReply: (ctx) => {
      const { leaves } = ctx;
      if (!leaves) return 'Leave data is still loading. Please try again in a moment.';
      const pending = leaves.requests.filter((r) => r.status === 'pending').length;
      return `You have **${leaves.balance.annual.remaining}** annual leave days remaining (${leaves.balance.sick.remaining} sick, ${leaves.balance.personal.remaining} personal). ${pending > 0 ? `You have ${pending} pending request(s).` : 'No pending requests.'} Visit the Leave page to submit a new request.`;
    },
  },
  {
    keywords: ['attendance', 'present', 'absent', 'hours', 'check in', 'checkin'],
    getReply: (ctx) => {
      const { attendance } = ctx;
      const workDays = attendance.filter((a) => a.status !== 'weekend');
      const present = workDays.filter((a) => a.status === 'present' || a.status === 'late').length;
      const totalHours = workDays.reduce((s, a) => s + a.hoursWorked, 0);
      const rate = workDays.length ? Math.round((present / workDays.length) * 100) : 0;
      return `Your attendance rate is **${rate}%** with **${totalHours.toFixed(1)}** total hours logged recently. You were present on ${present} of ${workDays.length} working days. Check the Attendance page for detailed charts.`;
    },
  },
  {
    keywords: ['team', 'colleague', 'employee', 'directory', 'who'],
    getReply: (ctx) => {
      const { employees } = ctx;
      const depts = [...new Set(employees.map((e) => e.department))];
      const onLeave = employees.filter((e) => e.status === 'on-leave').length;
      return `There are **${employees.length}** team members across ${depts.length} departments (${depts.join(', ')}). ${onLeave > 0 ? `${onLeave} colleague(s) are currently on leave.` : 'Everyone is active.'} Use Team Directory to search by name or department.`;
    },
  },
  {
    keywords: ['announcement', 'news', 'update', 'policy', 'meeting'],
    getReply: (ctx) => {
      const { announcements } = ctx;
      const high = announcements.filter((a) => a.priority === 'high');
      const latest = announcements[0];
      return `There are **${announcements.length}** announcements. ${high.length} high-priority item(s). Latest: "${latest?.title}" from ${latest?.author}. Use the AI Summarize button on any announcement for a quick summary.`;
    },
  },
  {
    keywords: ['profile', 'my info', 'email', 'manager', 'role'],
    getReply: (ctx) => {
      const { currentUser } = ctx;
      if (!currentUser) return 'Profile data is loading...';
      return `You are **${currentUser.name}**, ${currentUser.role} in ${currentUser.department}. Your manager is ${currentUser.manager}. Email: ${currentUser.email}. Visit your Profile page for full details.`;
    },
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help'],
    getReply: () =>
      "Hello! I'm your AI assistant. I can help with:\n• Leave balances & requests\n• Attendance & hours\n• Team directory info\n• Company announcements\n• Your profile details\n\nJust ask me anything!",
  },
  {
    keywords: ['dark', 'theme', 'mode'],
    getReply: () =>
      'You can toggle **dark mode** using the sun/moon button in the sidebar. Your preference is saved automatically.',
  },
  {
    keywords: ['calendar', 'schedule'],
    getReply: () =>
      'Check the **Calendar** page to see your attendance and leave schedule in a monthly view. You can click any date for event details.',
  },
];

function formatMarkdownBold(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export async function chatWithAssistant(message, context) {
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600));

  const lower = message.toLowerCase().trim();

  for (const rule of CHAT_RESPONSES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      const reply = rule.getReply(context);
      return { reply, formatted: formatMarkdownBold(reply) };
    }
  }

  const fallback =
    "I'm not sure about that. Try asking about your **leave balance**, **attendance**, **team members**, **announcements**, or **profile**. Type 'help' to see what I can do.";
  return { reply: fallback, formatted: formatMarkdownBold(fallback) };
}
