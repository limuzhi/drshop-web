import request from '@/utils/request'

// 查询字典数据列表
export function getDictDataList(query) {
  return request({
    url: '/api/v1/dict-data/list',
    method: 'GET',
    params: query
  })
}

// 查询字典数据详细
export function getDictDataDetail(dictCode) {
  return request({
    url: '//dict-data/detail?dictCode=' + dictCode,
    method: 'GET'
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return request({
    url: '/api/v1/dict-data/select?dictType=' + dictType,
    method: 'GET'
  })
}

// 新增字典数据
export function createDictData(data) {
  return request({
    url: '/api/v1/dict-data/create',
    method: 'POST',
    data: data
  })
}

// 修改字典数据
export function updateDictData(data) {
  return request({
    url: '/api/v1/dict-data/update',
    method: 'PUT',
    data: data
  })
}

// 删除字典数据
export function delDictData(data) {
  return request({
    url: '/api/v1/dict-data/delete',
    method: 'DELETE',
    data: data
  })
}
 
