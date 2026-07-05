import employeesData from '../data/employees.json';
import attendanceData from '../data/attendance.json';
import leavesData from '../data/leaves.json';
import announcementsData from '../data/announcements.json';
import currentUserData from '../data/currentUser.json';
import { getBusinessDays, computeLeaveBalance } from '../utils/leaveUtils';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const LEAVE_TOTALS = { annual: 20, sick: 10, personal: 5 };

function normalizeLeaves(data) {
  const requests = data.requests.map((r) => ({
    ...r,
    days: r.days ?? getBusinessDays(r.startDate, r.endDate),
    reason: r.reason.trim(),
  }));

  const balance = computeLeaveBalance(LEAVE_TOTALS, requests);

  return { balance, requests };
}

export const api = {
  async getCurrentUser() {
    await delay(400);
    return currentUserData;
  },

  async getEmployees() {
    await delay(600);
    return employeesData;
  },

  async getAttendance() {
    await delay(500);
    return attendanceData;
  },

  async getLeaves() {
    await delay(450);
    return normalizeLeaves(leavesData);
  },

  async getAnnouncements() {
    await delay(550);
    return announcementsData;
  },

  async submitLeaveRequest(request) {
    await delay(800);
    const days = getBusinessDays(request.startDate, request.endDate);
    const newRequest = {
      id: `leave-${Date.now()}`,
      startDate: request.startDate,
      endDate: request.endDate,
      type: request.type,
      reason: request.reason.trim(),
      days,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };
    return newRequest;
  },
};
