import pickle
import numpy as np
import pandas as pd

price = pickle.load(open('price_data.pkl', 'rb'))
period_mapping = {'daily': '24h', 'weekly': '1w', 'monthly': '1m'}

def get_tokens():
    return price.columns.tolist()

def get_data(rebalance_type, rebalance_period, rebalance_threshold, portfolio):
    portfolio_price = price[portfolio]
    stats = {}

    if rebalance_type == 'periodic':
        resample = period_mapping[rebalance_period]
        p = portfolio_price.resample(resample).mean()
        p = p.fillna(method='ffill')
        p = p.dropna()

        initial_price = p.iloc[0]
        initial_weights = np.ones(len(portfolio)) / len(portfolio)
        initial_allocation = 1000 * initial_weights / initial_price

        hodl = {}
        rb = {}

        current_allocation = initial_allocation

        for i, current_price in p.iterrows():
            # hodl positions
            hodl[i] = initial_allocation * current_price
            # current positions
            current_positions = current_allocation * current_price
            rb[i] = current_positions
            # rebalance
            current_portfolio_value = current_positions.sum()
            current_allocation = current_portfolio_value * initial_weights / current_price

        hodl = pd.DataFrame(hodl).T
        rb = pd.DataFrame(rb).T

        hodl_value = hodl.sum(axis=1)
        rb_value = rb.sum(axis=1)

        stats['hodl'] = 1 - (1 / ((hodl_value.iloc[-1] / hodl_value.iloc[0])))
        stats['snap'] = 1 - (1 / ((rb_value.iloc[-1] / rb_value.iloc[0])))
        stats['n_rebalances'] = len(p - 1)

        return hodl_value, rb_value, stats

    elif rebalance_type == 'threshold':
        p = portfolio_price.resample('24h').mean()
        p = p.fillna(method='ffill')
        p = p.dropna()

        initial_price = p.iloc[0]
        initial_weights = np.ones(len(portfolio)) / len(portfolio)
        initial_allocation = 1000 * initial_weights / initial_price

        hodl = {}
        rb = {}

        current_allocation = initial_allocation
        n_rebalances = 0

        for i, current_price in p.iterrows():
            # hodl positions
            hodl[i] = initial_allocation * current_price
            # current positions
            current_positions = current_allocation * current_price
            rb[i] = current_positions
            # rebalance
            current_portfolio_value = current_positions.sum()
            current_weights = current_positions / current_portfolio_value
            weights_diff = np.abs(current_weights - initial_weights)

            if any(weights_diff > (rebalance_threshold / 100.)):
                print(i, 'rebalancing')
                current_allocation = current_portfolio_value * initial_weights / current_price
                n_rebalances += 1

        print(n_rebalances)
        hodl = pd.DataFrame(hodl).T
        rb = pd.DataFrame(rb).T

        hodl_value = hodl.sum(axis=1)
        rb_value = rb.sum(axis=1)

        stats['hodl'] = 1 - (1 / ((hodl_value.iloc[-1] / hodl_value.iloc[0])))
        stats['snap'] = 1 - (1 / ((rb_value.iloc[-1] / rb_value.iloc[0])))
        stats['n_rebalances'] = n_rebalances

        return hodl_value, rb_value, stats
