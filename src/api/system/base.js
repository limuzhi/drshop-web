import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/v1/login',
    method: 'post',
    data
  })
}

export function refreshToken() {
  return request({
    url: '/api/v1/refreshToken',
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/api/v1/logout',
    method: 'post'
  })
}


export function getCodeImg() {
  return request({
    url: '/api/v1/captcha-img',
    method: 'get'
  })
}
