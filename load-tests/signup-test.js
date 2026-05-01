import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50,          // 50 virtual users
  duration: '20s',  // run for 20 seconds
};

function randomEmail() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
}

export default function () {
  const payload = JSON.stringify({
    email: randomEmail(),
    password: 'Password123'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(
    'http://localhost:5000/api/auth/signup',
    payload,
    params
  );

  check(res, {
    'is status 201': (r) => r.status === 201,
    'is not error': (r) => r.status < 500,
  });
}
