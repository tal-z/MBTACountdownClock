from flask import Flask, render_template, jsonify, request

from Timer import Timer




app = Flask(__name__)

b_countdown = 30
c_countdown = 20
d_countdown = 10

b_timer = Timer(duration=b_countdown,
                name='b',
                predictions_url='https://api-v3.mbta.com/predictions/'
                                '?filter[stop]=place-chill'
                                '&filter[route]=Green-B'
                                '&filter[direction_id]=1',
                schedule_url='https://api-v3.mbta.com/schedules/'
                             '?filter[stop]=place-chill'
                             '&filter[route]=Green-B'
                             '&filter[direction_id]=1')
c_timer = Timer(duration=c_countdown,
                name='c',
                predictions_url='https://api-v3.mbta.com/predictions/'
                                '?filter[stop]=place-clmnl'
                                '&filter[route]=Green-C'
                                '&filter[direction_id]=1',
                schedule_url='https://api-v3.mbta.com/schedules/'
                             '?filter[stop]=place-clmnl'
                             '&filter[route]=Green-C'
                             '&filter[direction_id]=1')
d_timer = Timer(duration=d_countdown,
                name='d',
                predictions_url='https://api-v3.mbta.com/predictions/'
                                '?filter[stop]=place-rsmnl'
                                '&filter[route]=Green-D'
                                '&filter[direction_id]=1',
                schedule_url='https://api-v3.mbta.com/schedules/'
                             '?filter[stop]=place-rsmnl'
                             '&filter[route]=Green-D'
                             '&filter[direction_id]=1')

timers = {'b_timer': b_timer, 'c_timer': c_timer, 'd_timer': d_timer}

@app.route("/", methods=["GET"])
def index():
    global b_timer
    b_timer.set_timer()
    global c_timer
    c_timer.set_timer()
    global d_timer
    d_timer.set_timer()
    return render_template("index.html")


@app.route("/_update_timer/<tmr>", methods=["GET", "POST"])
def timer(tmr):
    timers[tmr].decrement()
    seconds_remaining = timers[tmr].duration
    print(seconds_remaining)
    display = timers[tmr].set_display()
    return jsonify({f'{timers[tmr].name}_display': display,
                    f'{timers[tmr].name}_seconds_remaining': f'{seconds_remaining} seconds'})


@app.route("/NewTimer", methods=["GET", "POST"])
def new_timer():
    """Displays the new timer created in the CreateTimer route"""
    try:
        if request.method == 'POST':
            print(request.values)
            stop_name = request.values.get('search')#.replace(" ", "-")
            route_name = request.values.get('route-name')
            stop_id = request.values.get('stopid')
            route_id = request.values.get('routeid')
            direction_id = request.values.get('direction-options')
            direction_name = request.values.get('direction-name')
            predictions_url = f'https://api-v3.mbta.com/predictions/?filter[stop]={stop_id}&filter[route]={route_id}&filter[direction_id]={direction_id}'
            schedule_url=f'https://api-v3.mbta.com/schedules/?filter[stop]={stop_id}&filter[route]={route_id}&filter[direction_id]={direction_id}'
            new_timer = Timer(duration=-1, predictions_url=predictions_url, schedule_url=schedule_url, name="new")
            new_timer.stop_name = stop_name
            new_timer.direction_name = direction_name
            new_timer.route_name = route_name
            new_timer.set_timer()
            timers[new_timer.name] = new_timer
            context = {
                "new_timer": new_timer,
                }
            return render_template("NewTimer.html", context=context)
        else:
            timers["new"].set_timer()
            context = {
                "new_timer": timers["new"]
            }
        return render_template("NewTimer.html", context=context)
    except KeyError:
        return render_template("StopLookup.html")





@app.route("/CreateTimer", methods=["GET", "POST"])
def create_timer():
    return render_template("StopLookup.html")


if __name__ == "__main__":
    app.run(debug=True)
