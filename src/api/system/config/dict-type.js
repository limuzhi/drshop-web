import request from '@/utils/request'

// 查询字典类型列表
export function getDictTypeList(query) {
  return request({
    url: '/api/v1/dict-type/list',
    method: 'GET',
    params: query
  })
}

// 查询字典类型详细
export function getDictTypeDetail(dictId) {
  return request({
    url: '/api/v1/dict-type/detail?dictId=' + dictId,
    method: 'GET'
  })
}

// 新增字典类型
export function createDictType(data) {
  return request({
    url: '/api/v1/dict-type/create',
    method: 'POST',
    data: data
  })
}

// 修改字典类型
export function updateDictType(data) {
  return request({
    url: '/api/v1/dict-type/update',
    method: 'PUT',
    data: data
  })
}

// 删除字典类型
export function delDictType(data) {
  return request({
    url: '/api/v1/dict-type/delete',
    method: 'DELETE',
    data: data
  })
}
 
// 获取字典选择框列表
export function getDictTypeSelect() {
  return request({
    url: '/api/v1/dict-type/select',
    method: 'GET'
  })
}
