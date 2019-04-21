<template>
  <div class="page-container">
    <div class="md-layout">
      <div v-if="!started" class="md-layout-item">
        <div class="speech-bubble">
          <p>
            <strong>Welcome to Snap!</strong>
          </p>
          <p>Rebalancing your portfolio can be a difficult task, especially in a decentralised context, but Snap makes your life a little easier by letting you create rebalancing contracts. Just choose your assets and split, set a time period and top it up with funds and you're on your way to a balanced crypto fund. Let's get started!</p>
        </div>
        <!-- <face style="text-align: center; margin-left:1000px"/> -->
        <img
          style="text-align: center; margin-left:1000px; width:250px"
          src="@/assets/ThanosFace.png"
        >
        <br>
        <md-button
          @click="started=true"
          class="md-primary md-raised"
          style="text-align: center; margin-left:800px"
        >Get Started</md-button>
      </div>

      <div v-if="started" class="md-layout-item">
        <md-steppers :md-active-step.sync="active">
          <md-step
            id="first"
            md-label="Snapfund setup"
            style="background-color: #F0F2F5; padding-left:0px; padding-right:0px"
            :md-done.sync="first"
          >
            <div class="md-layout md-gutter">
              <div class="md-layout-item" style="padding-left:0px; padding-right:0px">
                <md-card style="padding:20px">
                  <h3>Set rebalance period</h3>
                  <p>
                    Your fund will rebalance automatically everytime this period
                    passes.
                    <br>You can change this later.
                  </p>
                  <div class="md-layout md-gutter">
                    <!-- <div class="md-layout-item">Rebalance Every:</div> -->
                    <div class="md-layout-item">
                      <md-field>
                        <label>Rebalance Every</label>
                        <md-input v-model="rebalancePeriod" type="number"></md-input>
                      </md-field>
                    </div>
                    <div class="md-layout-item">
                      <md-field>
                        <label for="rebalanceEvery">Period</label>
                        <md-select
                          v-model="rebalanceEvery"
                          name="rebalanceEvery"
                          id="rebalanceEvery"
                        >
                          <md-option value="hour">Hours</md-option>
                          <md-option value="day">Days</md-option>
                          <md-option value="week">Weeks</md-option>
                          <md-option value="month">Months</md-option>
                        </md-select>
                      </md-field>
                    </div>
                  </div>
                </md-card>
              </div>
              <div class="md-layout-item" style="padding-left:0px; padding-right:0px">
                <md-card style="padding:20px">
                  <h3>Set your first contribution amount!</h3>
                  <p>
                    This will be traded to achieve your desired Snapfund.
                    <br>You can add more or remove funds later.
                  </p>
                  <div class="md-layout md-gutter">
                    <div class="md-layout-item">
                      <md-field>
                        <label>Enter number</label>
                        <md-input v-model="addedEther" type="number"></md-input>
                      </md-field>
                    </div>
                    <div class="md-layout-item md-size-20">Eth</div>
                  </div>
                </md-card>
              </div>
            </div>

            <div class="md-layout">
              <div class="md-layout-item" style="padding-left:0px; padding-right:0px">
                <md-card style="padding:20px; margin-top:20px; margin-left:0px; margin-right:0px">
                  <div class="md-layout">
                    <div class="md-layout-item" style="padding-left:0px; padding-right:0px">
                      <h3>Name your Snapfund!</h3>
                      <p>You’ll get a sweet ENS domain, so make it catchy and at least 7 characters long.</p>
                      <md-field style="width:200px">
                        <label>Snapfund Name</label>
                        <md-input v-model="SnapfundName" maxlength="30"></md-input>.snapfund.eth
                      </md-field>
                    </div>
                    <div class="md-layout-item" style="padding-top:100px; text-align:right">
                      <md-button @click="started=false" class="md-secondary md-raised">Cancel</md-button>
                      <md-button
                        class="md-raised md-primary"
                        @click="setDone('first', 'second')"
                        :disabled="setupValidation"
                      >Next</md-button>
                    </div>
                  </div>
                </md-card>
              </div>
            </div>
          </md-step>

          <md-step
            id="second"
            md-label="Fund Distribution"
            style="background-color: #F0F2F5; padding-left:0px; padding-right:0px"
            :md-done.sync="second"
            :disabled="setupValidation"
          >
            <div>
              <div v-if="selected.length > 0">
                <div class="md-layout md-gutter">
                  <div class="md-layout-item" style="padding-left:0px; padding-right:0px">
                    <md-card style="padding:20px;  margin-top:20px">
                      <div class="md-layout md-gutter">
                        <div class="md-layout-item">
                          <h2>Select Snapfund distribution</h2>
                          <span
                            class="md-caption"
                          >Select the distribution of the diffrent assets to place within your Snapfund.</span>
                        </div>
                        <div class="md-layout-item md-size-20 md-alignment-center-right">
                          <md-button @click="showSelectTokenModal" class="md-primary md-raised">
                            <md-icon>add</md-icon>Add Tokens
                          </md-button>
                        </div>
                      </div>

                      <div v-for="(token, index) in selected" :key="index" style="padding-top:20px">
                        <div class="md-layout md-gutter md-alignment-center-center">
                          <div class="md-layout-item md-size-15 md-layout">
                            <div class="md-layout-item">
                              <cryptoicon
                                :symbol="token.symbol.toLowerCase()"
                                size="25"
                                style="margin-top:5px; marin-right:15px"
                              />
                            </div>
                            <div class="md-layout-item">
                              <h4>{{token.symbol}}</h4>
                            </div>
                          </div>
                          <div class="md-layout-item">
                            <vue-slider
                              v-model="token.ratio"
                              v-bind="options"
                              :dotOptions="{max: token.ratio + unselectedPercent}"
                              :max="100"
                              :tooltip="'always'"
                              :process-style="{ backgroundColor: colors[index] }"
                              :tooltip-style="{ backgroundColor: colors[index], borderColor: colors[index] }"
                            ></vue-slider>
                          </div>
                          <div class="md-layout-item md-size-10">
                            <md-button
                              class="md-icon-button md-raised md-accent"
                              @click="removeToken(token)"
                            >
                              <md-icon>remove</md-icon>
                            </md-button>
                          </div>
                        </div>
                      </div>
                    </md-card>
                  </div>

                  <div class="md-layout-item" style="padding-left:0px; padding-right:0px">
                    <md-card
                      class="md-alignment-center-center"
                      style="padding:20px;  margin-top:20px"
                    >
                      <h2>Visualize distribution</h2>
                      <div class="md-layout md-gutter">
                        <div class="md-layout-item">
                          <apexchart
                            type="donut"
                            width="400"
                            :options="pieValues.options"
                            :series="pieValues.values"
                            class="center"
                          />
                        </div>
                        <div class="md-layout-item">
                          <md-table class="md-caption" style="padding-top:25px">
                            <md-table-row>
                              <md-table-head>Key</md-table-head>
                              <md-table-head>Symbol</md-table-head>
                              <md-table-head>USD</md-table-head>
                              <md-table-head>Alocation</md-table-head>
                            </md-table-row>

                            <md-table-row v-for="(item, index) in selected" :key="index">
                              <md-table-cell>
                                <span class="dot" :style="'background:' + colors[index]"/>
                              </md-table-cell>
                              <md-table-cell>{{item.symbol}}</md-table-cell>
                              <md-table-cell>${{Math.round((item.ratio / 100) * addedEtherUsdValue)}}</md-table-cell>
                              <md-table-cell>{{item.ratio}}%</md-table-cell>
                            </md-table-row>
                          </md-table>
                        </div>
                      </div>
                      <div class="md-layout md-gutter">
                        <div class="md-layout-item">
                          <p>Unlocated: {{unselectedPercent}}%</p>
                        </div>
                        <div class="md-layout-item">
                          <p>Total Value: ${{addedEtherUsdValue}}</p>
                        </div>
                        <div class="md-layout-item md-size" style="text-align:right">
                          <md-button
                            @click="setDone('first', 'second')"
                            class="md-secondary md-raised"
                          >Back</md-button>
                          <md-button
                            :disabled="validSnapfund"
                            @click="setDone('second', 'third')"
                            class="md-raised md-primary"
                          >Next</md-button>
                        </div>
                      </div>
                    </md-card>
                  </div>
                </div>
              </div>
              <div v-if="selected.length==0">
                <div class="speech-bubble">
                  <p>
                    <strong>Add tokens to your Snapfund</strong>
                  </p>
                  <p>Select the tokens you want to add to this Snapfund and choose your distribution ratios! Your portfolio will automatically rebalance to keep this ratio when your time period rolls around!</p>
                </div>

                <img
                  style="text-align: center; margin-left:1000px; width:250px"
                  src="@/assets/ThanosFace.png"
                >
                <br>

                <md-button
                  @click="showSelectTokenModal"
                  class="md-primary md-raised"
                  style="text-align: center; margin-left:850px"
                >
                  <md-icon>add</md-icon>Add Tokens
                </md-button>
              </div>
            </div>
          </md-step>

          <md-step
            id="third"
            md-label="Confirmation"
            :md-done.sync="third"
            style="background-color: #F0F2F5; padding-left:0px; padding-right:0px"
          >
            <div class="md-layout md-gutter">
              <div class="md-layout-item" style="padding-left:0px; padding-right:0px">
                <md-card style="padding:20px;  margin-top:20px">
                  <h2>Final Distribution</h2>
                  <div class="md-layout md-gutter">
                    <div class="md-layout-item">
                      <apexchart
                        type="donut"
                        width="400"
                        :options="pieValues.options"
                        :series="pieValues.values"
                        class="center"
                      />
                    </div>
                    <div class="md-layout-item">
                      <md-table class="md-caption" style="padding-top:50px">
                        <div v-for="(item, index) in selected" :key="index">
                          <md-table-row>
                            <md-table-cell>
                              <span class="dot" :style="'background:' + colors[index]"/>
                            </md-table-cell>
                            <md-table-cell>{{item.symbol}}</md-table-cell>
                            <md-table-cell>${{Math.round((item.ratio / 100) * addedEtherUsdValue)}}</md-table-cell>
                            <md-table-cell>{{item.ratio}}%</md-table-cell>
                          </md-table-row>
                        </div>
                      </md-table>
                    </div>
                  </div>
                </md-card>
              </div>
              <div class="md-layout-item" style="padding-left:0px; padding-right:0px">
                <md-card style="padding:20px;  margin-top:20px">
                  <h2>Confirm your Snapfund details</h2>
                  <div class="md-layout md-gutter md-alignment-center-center">
                    <div class="md-layout-item md-size-30">Snapfund name:</div>
                    <div class="md-layout-item">
                      <md-field style="width:200px">
                        <label>Snapfund Name</label>
                        <md-input v-model="SnapfundName" maxlength="30"></md-input>.snapfund.eth
                      </md-field>
                    </div>
                  </div>
                  <div class="md-layout md-gutter md-alignment-center-center">
                    <div class="md-layout-item md-size-30">Rebalance every:</div>
                    <div class="md-layout-item">
                      <div class="md-layout md-gutter">
                        <!-- <div class="md-layout-item">Rebalance Every:</div> -->
                        <div class="md-layout-item">
                          <md-field>
                            <label>Rebalance Every</label>
                            <md-input v-model="rebalancePeriod" type="number"></md-input>
                          </md-field>
                        </div>
                        <div class="md-layout-item">
                          <md-field>
                            <label for="rebalanceEvery">Period</label>
                            <md-select
                              v-model="rebalanceEvery"
                              name="rebalanceEvery"
                              id="rebalanceEvery"
                            >
                              <md-option value="hour">Hours</md-option>
                              <md-option value="day">Days</md-option>
                              <md-option value="week">Weeks</md-option>
                              <md-option value="month">Months</md-option>
                            </md-select>
                          </md-field>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="md-layout md-gutter md-alignment-center-center">
                    <div class="md-layout-item md-size-30">Initial contribution:</div>
                    <div class="md-layout-item">
                      <md-field>
                        <label>Enter number</label>
                        <md-input v-model="addedEther" type="number"></md-input>
                      </md-field>
                    </div>
                  </div>
                  <div class="md-layout-item md-size" style="text-align:right">
                    <md-button
                      @click="setDone('first', 'second')"
                      class="md-secondary md-raised"
                    >Back</md-button>
                    <md-button
                      :disabled="validSnapfund || setupValidation"
                      @click="createFund"
                      class="md-raised md-primary"
                    >Create SnapFund 🚀</md-button>
                  </div>
                </md-card>
              </div>
            </div>
          </md-step>
        </md-steppers>
      </div>
    </div>

    <modal name="selectToken" :adaptive="true" width="1100" height="auto" :scrollable="true">
      <div class="md-layout">
        <div class="md-layout-item">
          <div class="md-layout">
            <div class="md-layout-item">
              <h1 style="padding-left:15px">Select tokens to add to Snapfund</h1>
            </div>
            <div class="md-layout-item-20" style="padding-top:10px">
              <md-button class="md-icon-button text-align: right" @click="hideSelectTokenModal">
                <md-icon>close</md-icon>
              </md-button>
            </div>
          </div>
          <md-table
            v-model="TokenInfo"
            md-card
            md-sort="symbol"
            md-sort-order="asc"
            class="md-scrollbar"
            :mdSelectedValue="selected"
            @md-selected="onSelect"
          >
            <md-table-row
              slot="md-table-row"
              slot-scope="{ item }"
              md-selectable="multiple"
              md-auto-select
            >
              <md-table-cell>
                <cryptoicon
                  :symbol="item.symbol.toLowerCase()"
                  size="25"
                  style="margin-top:5px; marin-right:15px"
                />
              </md-table-cell>
              <md-table-cell md-label="Symbol" md-sort-by="symbol">{{ item.symbol }}</md-table-cell>
              <md-table-cell md-label="Price" md-sort-by="price">${{ item.price.toPrecision(4) }}</md-table-cell>
              <md-table-cell
                md-label="Supply"
                md-sort-by="supply"
              >{{ Math.round(item.supply).toLocaleString('en') }}</md-table-cell>
              <md-table-cell
                md-label="Market Cap"
                md-sort-by="mktCap"
              >${{ Math.round(item.mktCap).toLocaleString('en') }}</md-table-cell>
              <md-table-cell
                md-label="24H Volume"
                md-sort-by="volume24Hour"
              >${{ Math.round(item.volume24Hour).toLocaleString('en') }}</md-table-cell>
              <md-table-cell md-label="24H" md-sort-by="change24Hour">{{ item.change24Hour }}%</md-table-cell>
            </md-table-row>
          </md-table>
        </div>
      </div>
      <div class="md-layout"></div>
    </modal>
  </div>
</template>

<script>
import * as actions from "@/store/actions";
import * as mutations from "@/store/mutation-types";
import ClickableAddress from "@/components/widgets/ClickableAddress";
import { mapActions, mapState } from "vuex";
import { constants } from "fs";
import face from "@/assets/ThanosFace.svg";

export default {
  name: "create",
  components: { ClickableAddress, face },
  data: () => ({
    selected: [],
    SnapfundName: "",
    rebalanceEvery: 0,
    rebalancePeriod: "",
    addedEther: 0,
    started: false,
    active: "first",
    first: false,
    second: false,
    third: false,
    colors: [
      "#A8A2F5",
      "#E66C82",
      "#F8D771",
      "#9BECBE",
      "#4371E0",
      "#CC83E9",
      "#F77D6A",
      "#D5F871",
      "#67E6ED",
      "#7B66F7"
    ]
  }),
  methods: {
    setDone(id, index) {
      this[id] = true;

      this.secondStepError = null;

      if (index) {
        this.active = index;
      }
    },
    showSelectTokenModal() {
      this.$modal.show("selectToken");
    },
    hideSelectTokenModal() {
      this.$modal.hide("selectToken");
    },
    getAlternateLabel(count) {
      let plural = "";

      if (count > 1) {
        plural = "s";
      }
      return `${count} token${plural} selected`;
    },
    onSelect(items) {
      //shitty hack to reset the selected ratio to zero
      //when items are removed via deselection from the menue
      if (items.length < this.selected.length) {
        let removedItem = this.selected.filter(previouslySelectedItem => {
          let found = true;
          items.forEach(function(selectedItem) {
            if (previouslySelectedItem == selectedItem) {
              found = false;
            }
          });
          return found;
        })[0];
        this.removeToken(removedItem);
      }
    },
    removeToken(token) {
      let removeIndex = this.selected
        .map(function(itterationToken) {
          return itterationToken.symbol;
        })
        .indexOf(token.symbol);
      this.selected[removeIndex].ratio = 0;
      this.selected.splice(removeIndex, 1);
    },
    getTokenIndex(token) {
      return this.selected
        .map(function(token) {
          return token.symbol;
        })
        .indexOf(token.symbol);
    },
    createFund() {
      let selected = this.selected;
      let SnapfundName = this.SnapfundName;
      let rebalanceEvery = this.rebalanceEvery;
      let rebalancePeriod = this.rebalancePeriod;
      let addedEther = this.addedEther;
      this.$store.dispatch(actions.CREATE_FUND, {
        selected,
        SnapfundName,
        rebalanceEvery,
        rebalancePeriod,
        addedEther
      });
    }
  },
  computed: {
    addedEtherUsdValue() {
      return this.addedEther * 170;
    },
    ...mapState(["TokenInfo"]),
    sliders() {
      let sliderValues = [];
      this.selected.forEach(function(selected) {
        sliderValues.push({ ...selected, remaining: 0 });
      });
      return sliderValues;
    },
    options() {
      let remaining = 100 - this.totalSelected;
      return {
        process: ([pos, i]) => [
          [0, pos],
          [pos, pos + remaining, { backgroundColor: "#999" }]
        ]
      };
    },
    totalSelected() {
      let total = 0;
      this.selected.forEach(function(selected) {
        if (selected.ratio) {
          total += selected.ratio;
        }
      });
      return total;
    },
    unselectedPercent() {
      return 100 - this.totalSelected;
    },
    pieValues() {
      let pieValues = [];
      let pieLabels = [];
      let pieColors = [];
      let count = 0;
      let colors = this.colors;
      this.selected.forEach(function(token) {
        pieValues.push(token.ratio);
        pieLabels.push(token.symbol);
        pieColors.push(colors[count]);
        count++;
      });

      pieValues.push(this.unselectedPercent);
      pieLabels.push("Remaining");
      pieColors.push("#999");
      return {
        values: pieValues,
        options: {
          labels: pieLabels,
          colors: pieColors,
          dataLabels: {
            enabled: true
          },
          responsive: [
            {
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  show: false
                }
              }
            }
          ],
          legend: {
            show: false
          }
        }
      };
    },
    validSnapfund() {
      if (this.unselectedPercent > 0) {
        return true;
      }
      return false;
    },
    setupValidation() {
      if (
        this.SnapfundName == "" ||
        this.rebalanceEvery == 0 ||
        this.rebalancePeriod == ""
      ) {
        return true;
      }
      return false;
    }
  }
};
</script>

<style>
.center {
  text-align: center;
}
.dot {
  vertical-align: middle;
  text-align: center;
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
}
.speech-bubble {
  background: #ffffff;
  -webkit-border-radius: 4px;
  border-radius: 4px;
  font-size: 1.2rem;
  line-height: 1.3;
  margin: 0 auto 40px;
  max-width: 400px;
  padding: 15px;
  position: relative;
}

.speech-bubble p {
  margin: 0 0 10px;
}
.speech-bubble p:last-of-type {
  margin-bottom: 0;
}

.speech-bubble::after {
  border-left: 20px solid transparent;
  border-top: 20px solid #ffffff;
  bottom: -20px;
  content: "";
  position: absolute;
  right: 20px;
}
</style>