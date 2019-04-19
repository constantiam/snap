<template>
  <div class="page-container">
    <div class="md-layout md-alignment-top-center" style="margin-left:30px; margin-right:30px;">
      <div class="md-layout-item">
        <md-card style="padding-left:30px; padding-right:30px;">
          <div v-if="selected.length > 0">
            <div class="md-layout md-gutter md-alignment-center-center">
              <div class="md-layout-item">
                <md-field>
                  <label>Portfolio Name</label>
                  <md-input v-model="portfolioName" maxlength="30"></md-input>
                </md-field>
              </div>
              <div class="md-layout-item">
                <div class="md-layout md-gutter">
                  <div class="md-layout-item">
                    <md-field>
                      <label>Rebalance Every</label>
                      <md-input v-model="rebalancePeriod" type="number"></md-input>
                    </md-field>
                  </div>
                  <div class="md-layout-item">
                    <md-field>
                      <label for="rebalanceEvery">Period</label>
                      <md-select v-model="rebalanceEvery" name="rebalanceEvery" id="rebalanceEvery">
                        <md-option value="hour">Hours</md-option>
                        <md-option value="day">Days</md-option>
                        <md-option value="week">Weeks</md-option>
                        <md-option value="month">Months</md-option>
                      </md-select>
                    </md-field>
                  </div>
                </div>
              </div>
              <div class="md-layout-item md-size-20 md-alignment-right">
                <md-button @click="showSelectTokenModal" class="md-primary md-raised">
                  <md-icon>add</md-icon>Add Tokens
                </md-button>
              </div>
            </div>

            <hr>
            <div class="md-layout md-gutter md-alignment-top-center">
              <div class="md-layout-item">
                <h2>Select portfolio distribution</h2>
                <span
                  class="md-caption"
                >Select the distribution of the diffrent assets to place within your portfolio.</span>
                <div v-for="token in selected">
                  <div class="md-layout md-alignment-center-center md-gutter">
                    <div class="md-layout-item md-size-10 md-layout md-alignment-center-center">
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
                      ></vue-slider>
                    </div>
                    <div class="md-layout-item md-size-5">
                      <md-button
                        class="md-icon-button md-raised md-accent"
                        @click="removeToken(token)"
                      >
                        <md-icon>remove</md-icon>
                      </md-button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="md-layout-item md-size-30">
                <h2>Visualize distribution</h2>
                <apexchart
                  type="donut"
                  width="400"
                  :options="pieValues.options"
                  :series="pieValues.values"
                />
              </div>
            </div>

            <div class="md-layout md-gutter md-alignment-center-center" style="padding-bottom:20px">
              <div class="md-layout-item">
                <p>Unalocated: {{unselectedPercent}}</p>
              </div>
              <div class="md-layout-item md-size">
                <md-button :disabled="validPortfolio" class="md-raised md-primary">Create Portfolio</md-button>
              </div>
            </div>
          </div>
          <div>
            <md-empty-state
              md-icon="account_balance"
              md-label="Create a new portfolio"
              md-description="Enter a portfolio name above and then start adding tokens. You can select the diffrent ratios for each and select a rebalance period."
              v-if="selected.length==0"
            >
              <md-button @click="showSelectTokenModal" class="md-primary md-raised">Add Tokens</md-button>
            </md-empty-state>
          </div>
        </md-card>
      </div>
    </div>

    <modal name="selectToken" :adaptive="true" width="1100" height="auto" :scrollable="true">
      <div class="md-layout">
        <div class="md-layout-item">
          <div class="md-layout">
            <div class="md-layout-item">
              <h1 style="padding-left:15px">Select tokens to add to portfolio</h1>
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
export default {
  name: "create",
  components: { ClickableAddress },
  data: () => ({
    selected: [],
    portfolioName: "",
    rebalanceEvery: 0,
    rebalancePeriod: ""
  }),
  methods: {
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
    }
  },
  computed: {
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
        process: ([pos]) => [
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
      let colors = [
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
      ];
      let pieValues = [];
      let pieLabels = [];
      let pieColors = [];
      let count = 0;
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
          legend: {
            position: "top"
          }
        }
      };
    },
    validPortfolio() {
      if (
        this.unselectedPercent > 0 ||
        this.portfolioName == "" ||
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
