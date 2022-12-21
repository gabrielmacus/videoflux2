const state = {
  user:{},
  offlineMode:false
}

const mutations = {
  SET_USER(state,data)
  {
    state.user = data;
  },
  SET_OFFLINE_MODE(state, data)
  {
    state.offlineMode = data;
  }
}


const actions = {
  setData({commit},data)
  {
    commit("SET_USER",data);

  },
  setOfflineMode({commit},data)
  {
    commit("SET_OFFLINE_MODE",data);
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
