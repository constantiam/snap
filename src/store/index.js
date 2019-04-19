import Web3 from "web3";
import Vuex from "vuex";
import Vue from "vue";
import axios from "axios";
import createPersistedState from "vuex-persistedstate";
import moment from "moment";

import {
  getEtherscanAddress,
  getNetIdString,
}
from "@/utils/lookupTools";

import getTokenInfo from "@/utils/TokenInfo.js"

import * as actions from "./actions";
import * as mutations from "./mutation-types";

import truffleContract from "truffle-contract";
// import VyperStorageABI from "../../build/contracts/VyperStorage.json"
// const VyperStorage = truffleContract(VyperStorageABI)
// import RadiCardsABI from "../../build/contracts/RadiCards.json";
// const RadiCards = truffleContract(RadiCardsABI);

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    web3: null,
    account: null,
    currentNetwork: null,
    etherscanBase: null,
    TokenInfo: null
  },
  mutations: {
    //WEB3 Stuff
    [mutations.SET_ACCOUNT](state, account) {
      state.account = account;
    },
    [mutations.SET_CURRENT_NETWORK](state, currentNetwork) {
      state.currentNetwork = currentNetwork;
    },
    [mutations.SET_ETHERSCAN_NETWORK](state, etherscanBase) {
      state.etherscanBase = etherscanBase;
    },
    [mutations.SET_TOKEN_ADDRESSES](state, TokenInfo) {
      state.TokenInfo = TokenInfo;
    },
    [mutations.SET_WEB3]: async function (state, web3) {
      state.web3 = web3;
    },
  },
  actions: {
    [actions.GET_CURRENT_NETWORK]: function ({
      commit,
      dispatch,
      state
    }) {
      getNetIdString().then(currentNetwork => {
        commit(mutations.SET_CURRENT_NETWORK, currentNetwork);
      });
      getEtherscanAddress().then(etherscanBase => {
        commit(mutations.SET_ETHERSCAN_NETWORK, etherscanBase);
      });
      console.log('get')
      getTokenInfo().then(TokenInfo => {
        console.log("TokenInfo")
        console.log(TokenInfo)
        commit(mutations.SET_TOKEN_ADDRESSES, TokenInfo)
      })

    },

    [actions.INIT_APP]: async function ({
      commit,
      dispatch,
      state
    }, web3) {
      // VyperStorage.setProvider(web3.currentProvider)
      // RadiCards.setProvider(web3.currentProvider);
      // Set the web3 instance
      console.log("IN STORE")
      console.log(web3)
      commit(mutations.SET_WEB3, {
        web3
      });
      console.log("set")

      dispatch(actions.GET_CURRENT_NETWORK);

      let accounts = await web3.eth.getAccounts();
      let account = accounts[0];
      if (account) {
        commit(mutations.SET_ACCOUNT, account);
      }

      //let contract = await RadiCards.deployed();
      // let VyperStorageContract = await VyperStorage.deployed()
      console.log("logging vyper from UI")
      // console.log((await VyperStorageContract.get()).toString(10))
    }
  }
})