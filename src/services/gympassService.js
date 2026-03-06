const env = require('../config/env');
const { request } = require('../lib/httpClient');

class GympassService {
  constructor() {
    this.token = env.gympassApiKey;
  }

  createClasses(gymId, payload) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes`,
      method: 'POST',
      token: this.token,
      body: payload,
    });
  }

  listClasses(gymId) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes`,
      method: 'GET',
      token: this.token,
    });
  }

  getClass(gymId, classId, showDeleted) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes/${classId}`,
      method: 'GET',
      token: this.token,
      query: { 'show-deleted': showDeleted },
    });
  }

  updateClass(gymId, classId, payload) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes/${classId}`,
      method: 'PUT',
      token: this.token,
      body: payload,
    });
  }

  createSlot(gymId, classId, payload) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes/${classId}/slots`,
      method: 'POST',
      token: this.token,
      body: payload,
    });
  }

  getSlot(gymId, classId, slotId) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes/${classId}/slots/${slotId}`,
      method: 'GET',
      token: this.token,
    });
  }

  listSlots(gymId, classId, query) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes/${classId}/slots`,
      method: 'GET',
      token: this.token,
      query,
    });
  }

  deleteSlot(gymId, classId, slotId) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes/${classId}/slots/${slotId}`,
      method: 'DELETE',
      token: this.token,
    });
  }

  patchSlot(gymId, classId, slotId, payload) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes/${classId}/slots/${slotId}`,
      method: 'PATCH',
      token: this.token,
      body: payload,
    });
  }

  updateSlot(gymId, classId, slotId, payload) {
    return request({
      baseUrl: env.bookingBaseUrl,
      path: `/gyms/${gymId}/classes/${classId}/slots/${slotId}`,
      method: 'PUT',
      token: this.token,
      body: payload,
    });
  }

  validateBooking(gymId, bookingNumber, payload) {
    return request({
      baseUrl: env.bookingV2BaseUrl,
      path: `/gyms/${gymId}/bookings/${bookingNumber}`,
      method: 'PATCH',
      token: this.token,
      body: payload,
    });
  }

  listGymProducts(gymId) {
    return request({
      baseUrl: env.setupBaseUrl,
      path: `/gyms/${gymId}/products`,
      method: 'GET',
      token: this.token,
    });
  }

  validateCheckin(gymId, payload) {
    return request({
      baseUrl: env.accessBaseUrl,
      path: '/validate',
      method: 'POST',
      token: this.token,
      headers: { 'X-Gym-Id': String(gymId) },
      body: payload,
    });
  }
}

module.exports = new GympassService();
