Matrix = require("./matrixTransform").Matrix

# we have at least 3 points with different coordinates
class AffineTransformer
  # formula of new coordinates:
  # V = M*X + e
  # where V is a result coordinates, X is a vector of original coordinates
  M: null #Matrix of transformation
  e: null #move vector

  isValidArray: (arr) ->
    if arr and Array.isArray(arr) and arr.length == 3
      i = 0
      while i < arr.length
        ai = arr[i]
        if typeof (ai.x) isnt "number"
            return false
        if typeof (ai.y) isnt "number"
            return false
        i++
      #check that 3 points not on same line
      return @isAllPointsDifferent(arr) && !@isOnSameLine(arr)
    false

  isOnSameLine: (arr)->
    a = arr[0];
    b = arr[1];
    c = arr[2];
    if(c.x == b.x)
        d = a
        a = b
        b = c
        c = d
    if(c.x == b.x)
        return true # all has same X - so it is same line
    y = b.y + (c.y - b.y)*(a.x - b.x)/(c.x - b.x)
    return y == a.y

  isAllPointsDifferent: (arr)->
    for i, ii in arr.length
      for j, jj in arr.length
          if(ii == jj)
              continue
          if(i.x == j.x && i.y == j.y)
              return false
    return true;


  findMatrix: (arr)->
    unless @isValidArray(arr)
      console.log("ERROR: INVALID ARRAY OF POINTS")
      throw new Error("Invalid array of points");

    x1 = arr[0].x
    x2 = arr[1].x
    x3 = arr[2].x
    y1 = arr[0].y
    y2 = arr[1].y
    y3 = arr[2].y
    a1 = arr[0].x2
    a2 = arr[1].x2
    a3 = arr[2].x2
    b1 = arr[0].y2
    b2 = arr[1].y2
    b3 = arr[2].y2
    o = new Matrix([
      x2 - x1
      x3 - x1
      y2 - y1
      y3 - y1
    ])
    
    n = new Matrix([
      a2 - a1
      a3 - a1
      b2 - b1
      b3 - b1
    ])
    
    @M = n.multiply(o.inverse())
    console.log @M.getRow(1)
    console.log @M.getRow(2)
    rp = @M.multiply(new Matrix([
      [x1]
      [y1]
    ]))
    @e = new Matrix([
      [a1]
      [b1]
    ]).subtract(rp)
    console.log @e.getRow(1)
    console.log @e.getRow(2)

  getPoint: (x, y) ->
    r = @e.add(@M.multiply(new Matrix([
      [x]
      [y]
    ])))
    return {
        a: r.getRow(1)[0]
        b: r.getRow(2)[0]
    }

  getMatrix: ()->
    return @M

  setMatrix: (m)->
    @M = m

  getDifferencePart: ()->
    return @e

  setDifferencePart: (e)->
    @e = e;

module.exports = AffineTransformer