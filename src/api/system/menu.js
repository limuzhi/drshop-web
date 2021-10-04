import request from '@/utils/request'

// 获取菜单树
export function getMenuTree() {
  return request({
    url: '/api/v1/menu/tree',
    method: 'get'
  })
}

// 获取菜单列表
export function getMenus() {
  return request({
    url: '/api/v1/menu/list',
    method: 'get'
  })
}

// 创建菜单
export function createMenu(data) {
  return request({
    url: '/api/v1/menu/create',
    method: 'post',
    data
  })
}

// 更新菜单
export function updateMenu(data) {
  return request({
    url: '/api/v1/menu/update',
    method: 'put',
    data
  })
}

// 批量删除菜单
export function batchDeleteMenu(data) {
  return request({
    url: '/api/v1/menu/batchDelete',
    method: 'delete',
    data
  })
}

// 获取用户的可访问菜单列表
export function getUserMenus() {
  return request({
    url: '/api/v1/menu/access/list',
    method: 'get'
  })
}

// 获取用户的可访问菜单树
export function getUserMenuTree() {
  return request({
    url: '/api/v1/menu/access/tree',
    method: 'get'
  })
}
