const state = {
  user:{}
}

const mutations = {
  SET_USER(state,data)
  {
    state.user = data;
  },

}


const actions = {
  setData({commit},data)
  {
    commit("SET_USER",data);
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
