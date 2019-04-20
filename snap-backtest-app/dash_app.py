import base64
import os

import dash
import dash_core_components as dcc
import dash_html_components as html
import flask
import numpy as np
import plotly.graph_objs as go

from api import get_data, get_tokens

STATIC_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
print(STATIC_PATH)

app = dash.Dash(__name__)

bar_buttons_to_remove = ['zoom2d', 'pan2d', 'select2d', 'lasso2d', 'zoomIn2d',
                         'zoomOut2d', 'autoScale2d', 'sendDataToCloud',
                         'hoverClosestCartesian', 'hoverCompareCartesian',
                         'toggleSpikelines']

thanos_color = '#774C6C'
slider_max = 30
slider_step= 2
rebalance_type = None
tokens = get_tokens()

@app.server.route('/static/<resource>')
def serve_static(resource):
    return flask.send_from_directory(STATIC_PATH, resource)

app.css.append_css({
    'external_url': '/static/dash_app.css',
})

logo_fn = 'logo.png'
thanos_fn = 'thanos.png'
encoded_logo = base64.b64encode(open(logo_fn, 'rb').read())
encoded_thanos = base64.b64encode(open(thanos_fn, 'rb').read())

app.layout = html.Div(children=[


    html.Div(id='header', children=[

        html.Img(src='data:image/png;base64,{}'.format(encoded_logo.decode()),
            style={'vertical-align': 'middle', 'margin': '1%', 'margin-left': '1%', 'height':
                '50px', 'width': 'auto', 'text-align': 'left'}
        ),

        html.H2(
            children='Snapfund Backtester',
            style={
                'display': 'inline', 'color': 'white', 'vertical-align': 'middle', 'margin-left':
                '20%','margin-right': '20%'
                }
            ),

        html.Img(src='data:image/png;base64,{}'.format(encoded_thanos.decode()),
            style={'vertical-align': 'middle', 'margin': '1%', 'margin-left': '3%', 'height':
                '100px', 'width': 'auto', 'text-align': 'right', 'margin-right': '1%'}
        ),

        ], style={'margin-bottom': '3%', 'background-color': thanos_color, 'vertical-align':
            'middle', 'text-align': 'center'}),

       html.Div(id='controls', children=[
            html.Div(id='token-selector', children=[
                html.Div('Portfolio', style={'margin-bottom': '2%', 'font-weight': 'bold', 'font-size': '150%'}),
                dcc.Checklist(
                    id='selected-tokens',
                    options=[{'label': i, 'value': i} for i in tokens],
                    values=['ETH', 'DAI'],
                    style={'font-size': '120%'},
                ),
                ], style={'text-align': 'center', 'margin': '5%'}),

            html.Div(id='rebalance-type-dropdown', children=[
                html.Div('Rebalancing type',
                    style={'margin-bottom': '2%', 'font-weight': 'normal', 'font-size': '130%'}),
                dcc.Dropdown(
                        id='rebalance-type',
                        options=[{'label': i, 'value': i} for i in [ 'periodic', 'threshold']],
                    ),
            ], style={'text-align': 'center', 'margin': '5%', }),

            html.Div(id='rebalance-period-dropdown', children=[
                html.Div('Rebalancing period',
                    style={'margin-bottom': '2%', 'font-weight': 'normal', 'font-size': '130%'}),
                dcc.Dropdown(
                    id='rebalance-period',
                    options=[{'label': i, 'value': i} for i in ['daily', 'weekly', 'monthly']],
                ),
                ], style={'text-align': 'center', 'margin': '5%', }),

            html.Div(id='rebalance-threshold-slider', children=[
                html.Div('Rebalancing threshold',
                    style={'margin-bottom': '2%', 'font-weight': 'normal', 'font-size': '130%'}),
                dcc.Slider(
                    id='rebalance-threshold',
                    min=0,
                    max=slider_max,
                    step=slider_step,
                    value=10,
                    marks={int(i): '{} '.format(i) for i in np.arange(0, slider_max + 1, slider_step)},
                    ),
                ], style={'text-align': 'center', 'margin': '5%',}),

            html.Div(id='submit-button', children=[
                html.Button('Snap it!', id='button', className='sbutton')],
                style={'color': thanos_color, 'margin': '5%'}),

            ], style={'text-align': 'center', 'width': '50%', 'margin': '5%', 'margin-left': '25%',
                     'margin-right': '25%', 'border': '3px solid {}'.format(thanos_color)}),

    html.P(id='placeholder'),

    html.Div([
        dcc.Graph(
            id='line-plot', config={'modeBarButtonsToRemove': bar_buttons_to_remove},
            ),
        ], style={'background': '#ffffff', 'margin-top': '10%', }),
    ], style={'margin-left': '10%', 'margin-right': '10%', 'width': '75%', 'text-align': 'center',
              'background-color': 'white', 'color': thanos_color, 'font-family': 'Courier New'})


@app.callback(
    dash.dependencies.Output('placeholder', 'id'),
    [
        dash.dependencies.Input('rebalance-type', 'value'),
        dash.dependencies.Input('rebalance-period', 'value'),
        dash.dependencies.Input('rebalance-threshold', 'value'),
        dash.dependencies.Input('selected-tokens', 'values'),
        ],
    )
def update_parameters(rtype, rperiod, rthreshold, portf):
    global rebalance_type
    global rebalance_period
    global rebalance_threshold
    global portfolio
    rebalance_type = rtype
    rebalance_period = rperiod
    rebalance_threshold = rthreshold
    portfolio = portf
    print(rebalance_type,
          rebalance_period,
          rebalance_threshold,
          portfolio)
    return

@app.callback(
    dash.dependencies.Output('line-plot', 'figure'),
    [dash.dependencies.Input('button', 'n_clicks')])
def update_chart(threshold):
    return create_chart()

def create_chart():
    global rebalance_type
    global rebalance_period
    global rebalance_threshold
    global portfolio
    if rebalance_type is None:
        return {}
    hodl, snap, stats = get_data(rebalance_type, rebalance_period, rebalance_threshold, portfolio)
    return {
        'data': [
            go.Line(
                x=snap.index,
                y=snap.values,
                mode='lines',
                name='Snapfund',
                marker={
                        'size': 5,
                        'color': '#774C6C',
                        'opacity': 0.9,
                    },
        ),
           go.Line(
                x=hodl.index,
                y=hodl.values,
                mode='lines',
                name='HODL',
                marker={
                        'size': 5,
                        'color': '#7FDBFF',
                        'opacity': 0.9,
                    },
        )],

       'layout': {
           'height': 500,
           'margin': {'l': 60, 'b': 30, 'r': 10, 't': 10},
           'annotations': [{
               'x': 0.51, 'y': 0.85, 'xanchor': 'center', 'yanchor': 'bottom',
               'xref': 'paper', 'yref': 'paper', 'showarrow': False,
               'text-align': 'center', 'bgcolor': 'rgba(255, 255, 255, 0.5)',
               'text': """Snapfund final: {:.2f}% \n
                          HODL final: {:.2f}% \n
                          Rebalanced: {} times
               """.format(stats['snap'] * 100, stats['hodl'] * 100, stats['n_rebalances'])
           }],
           'yaxis': {'color': '#505050'},
           'xaxis': {'showgrid': False, 'color': '#505050'},
           'paper_bgcolor': '#ffffff',
           'plot_bgcolor': '#ffffff',
       }
    }

if __name__ == '__main__':
    app.run_server(debug=True, use_reloader=True, host='0.0.0.0', port=8050)
