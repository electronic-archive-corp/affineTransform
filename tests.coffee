AffineTransformer = require("./app.js")

a = new AffineTransformer;

test = (v, descr, point) ->
  a.findMatrix v
  res = a.getPoint(point[0], point[1])
  console.log descr + "    [" + res.a + "," + res.b + "]"

tests = (v, d) ->
  a.findMatrix v
  for i of d
    if d.hasOwnProperty(i)
      di = d[i]
      res = a.getPoint(di.p[0], di.p[1])
      console.log di.d + "    [" + res.a + "," + res.b + "]"

mulX = [
  {
    x: 0
    y: 0
    x2: 0
    y2: 0
  }
  {
    x: 1
    y: 0
    x2: 2
    y2: 0
  }
  {
    x: 0
    y: 1
    x2: 0
    y2: 1
  }
]

test mulX, "mulX Result of 2,2 should be 4,2", [2,2]

mulY = [
  {
    x: 0
    y: 0
    x2: 0
    y2: 0
  }
  {
    x: 1
    y: 0
    x2: 1
    y2: 0
  }
  {
    x: 0
    y: 1
    x2: 0
    y2: 2
  }
]

test mulY, "mulY Result of 2,2 should be 2,4", [2,2]

difX = [
  {
    x: 0
    y: 0
    x2: 5
    y2: 5
  }
  {
    x: 1
    y: 0
    x2: 6
    y2: 5
  }
  {
    x: 0
    y: 1
    x2: 5
    y2: 6
  }
]

test difX, "difX Result of 2,2 should be 7,7", [2, 2]

rot = [
  {
    x: 0
    y: 0
    x2: 0
    y2: 0
  }
  {
    x: 1
    y: 0
    x2: 0
    y2: 1
  }
  {
    x: 0
    y: 1
    x2: -1
    y2: 0
  }
]

test rot, "rot Result of 2,2 should be -2,2", [2, 2]

q = [
  {
    x: 0
    y: 0
    x2: 0
    y2: 0
  }
  {
    x: 1
    y: 1
    x2: 1
    y2: 0
  }
  {
    x: 0
    y: 1
    x2: 0
    y2: 1
  }
]

test q, "q Result of 2,2 should be 2,0", [2, 2]

arr = [
  {
    x: 5
    y: 5
    x2: -1
    y2: 2
  }
  {
    x: 9
    y: 8
    x2: 2.5
    y2: 1.5
  }
  {
    x: 8
    y: 4
    x2: 0
    y2: 0
  }
]

tests arr, [
  {
    d: "Result of 5,5 should be -1,2"
    p: [5, 5]
  }
  {
    d: "Result of 9,8 should be 2.5,1.5"
    p: [9, 8]
  }
  {
    d: "Result of 8,4 should be 0,0"
    p: [8, 4]
  }
  {
    d: "Result of 11,7 should be 3,0"
    p: [11, 7]
  }
]
