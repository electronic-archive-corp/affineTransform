//var Affine = require("./matrix").Matrix;
var Matrix = require("./matrixTransform").Matrix;


// we have at least 3 points with different coordinates
var a = {
    arr: null,
    basePoints: null,
    matrix: null,
    e: null,
    //affine: null,

    init: function(arr){
        if(!this.isValidArray(arr))
            return console.log("ERROR: INVALID ARRAY OF POINTS");

        this.arr = arr;
        this.matrix = this.findMatrixElems();
    },

    isValidArray: function(arr){
        if(arr && Array.isArray(arr) && arr.length >= 3){
            for(i = 0; i < arr.length; i++){
                var ai = arr[i];
                if(typeof(ai.x) != 'number' || ai.x < 0 ){
                    return false;
                }
                if(typeof(ai.y) != 'number' || ai.y < 0 ){
                    return false;
                }
            }

            var isValid = false;
            //check all possible 3-points

            // and find at least one combination with correct points
            this.basePoints = arr;
            isValid = true;

            return isValid;
        }
        return false;
    },

    findMatrixElems: function(){
        var x1 = this.basePoints[0].x;
        var x2 = this.basePoints[1].x;
        var x3 = this.basePoints[2].x;
        var y1 = this.basePoints[0].y;
        var y2 = this.basePoints[1].y;
        var y3 = this.basePoints[2].y;

        var a1 = this.basePoints[0].x2;
        var a2 = this.basePoints[1].x2;
        var a3 = this.basePoints[2].x2;
        var b1 = this.basePoints[0].y2;
        var b2 = this.basePoints[1].y2;
        var b3 = this.basePoints[2].y2;

        var o = new Matrix( [
            x2 - x1, x3 - x1,
            y2 - y1, y3 - y1
        ]);
        //console.log( "o:", o.getRow(1), o.getRow(2) );

        var n = new Matrix( [
            a2 - a1, a3 - a1,
            b2 - b1, b3 - b1
        ]);
        //console.log( "n:", n.getRow(1), n.getRow(2) );

        this.M = n.multiply(o.inverse());
        console.log(this.M.getRow(1));
        console.log(this.M.getRow(2));

        var rp = this.M.multiply(new Matrix([[x1], [y1]]));

        this.e = new Matrix([[a1], [b1]]).subtract(rp);
        console.log(this.e.getRow(1));
        console.log(this.e.getRow(2));
    },

    getPoint: function(x, y){
        var r = this.e.add(this.M.multiply(new Matrix([[x], [y]])));
        return {
            a: r.getRow(1)[0],
            b: r.getRow(2)[0]
        }
    }
};

function test(v, descr, point){
    a.init(v);
    var res = a.getPoint(point[0], point[1]);
    console.log(descr + "    [" + res.a + "," + res.b + "]");
}

function tests(v, d){
    a.init(v);
    for(var i in d){
        if(d.hasOwnProperty(i)){
            var di = d[i];
            var res = a.getPoint(di.p[0], di.p[1]);
            console.log(di.d + "    [" + res.a + "," + res.b + "]");
        }
    }
}

var mulX = [{x: 0, y: 0, x2: 0, y2: 0}, {x: 1, y: 0, x2: 2, y2: 0}, {x: 0, y: 1, x2: 0, y2: 1 }];
test(mulX, "mulX Result of 2,2 should be 4,2", [2, 2]);

var mulY = [{x: 0, y: 0, x2: 0, y2: 0}, {x: 1, y: 0, x2: 1, y2: 0}, {x: 0, y: 1, x2: 0, y2: 2 }];
test(mulY, "mulY Result of 2,2 should be 2,4", [2, 2]);

var difX = [{x: 0, y: 0, x2: 5, y2: 5}, {x: 1, y: 0, x2: 6, y2: 5}, {x: 0, y: 1, x2: 5, y2: 6 }];
test(difX, "difX Result of 2,2 should be 7,7", [2, 2]);

var rot = [{x: 0, y: 0, x2: 0, y2: 0}, {x: 1, y: 0, x2: 0, y2: 1}, {x: 0, y: 1, x2: -1, y2: 0 }];
test(rot, "rot Result of 2,2 should be -2,2", [2, 2]);

var q = [{x: 0, y: 0, x2: 0, y2: 0}, {x: 1, y: 1, x2: 1, y2: 0}, {x: 0, y: 1, x2: 0, y2: 1 }];
test(q, "q Result of 2,2 should be 2,0", [2, 2]);

var arr = [
    {
        x: 5,
        y: 5,
        x2: -1,
        y2: 2
    },
    {
        x: 9,
        y: 8,
        x2: 2.5,
        y2: 1.5
    },
    {
        x: 8,
        y: 4,
        x2: 0,
        y2: 0
    }
];

tests(arr, [
    {
        d: "Result of 5,5 should be -1,2",
        p: [5, 5]
    },
    {
        d: "Result of 9,8 should be 2.5,1.5",
        p: [9, 8]
    },
    {
        d: "Result of 8,4 should be 0,0",
        p: [8, 4]
    }
]);