
var Point = {
    x: null,
    y: null
};

exports.Matrix = {
    initialize: function Matrix(arg) {
        var count = arguments.length,
            ok = true;
        if (count === 6) {
            this.set.apply(this, arguments);
        } else if (count === 1) {
            if (arg instanceof Matrix) {
                this.set(arg._a, arg._c, arg._b, arg._d, arg._tx, arg._ty);
            } else if (Array.isArray(arg)) {
                this.set.apply(this, arg);
            } else {
                ok = false;
            }
        } else if (count === 0) {
            this.reset();
        } else {
            ok = false;
        }
        if (!ok)
            throw new Error('Unsupported matrix parameters');
    },

    set: function(a, c, b, d, tx, ty, _dontNotify) {
        this._a = a;
        this._c = c;
        this._b = b;
        this._d = d;
        this._tx = tx;
        this._ty = ty;
        if (!_dontNotify)
            this._changed();
        return this;
    },

    _serialize: function(options) {
        return Base.serialize(this.getValues(), options);
    },

    _changed: function() {
        if (this._owner)
            this._owner._changed(5);
    },

    clone: function() {
        return new Matrix(this._a, this._c, this._b, this._d,
            this._tx, this._ty);
    },

    equals: function(mx) {
        return mx === this || mx && this._a === mx._a && this._b === mx._b
            && this._c === mx._c && this._d === mx._d
            && this._tx === mx._tx && this._ty === mx._ty
            || false;
    },

    toString: function() {
        var f = Formatter.instance;
        return '[[' + [f.number(this._a), f.number(this._b),
            f.number(this._tx)].join(', ') + '], ['
            + [f.number(this._c), f.number(this._d),
            f.number(this._ty)].join(', ') + ']]';
    },

    reset: function() {
        this._a = this._d = 1;
        this._c = this._b = this._tx = this._ty = 0;
        this._changed();
        return this;
    },

    scale: function() {
        var scale = Point.read(arguments),
            center = Point.read(arguments, 0, 0, { readNull: true });
        if (center)
            this.translate(center);
        this._a *= scale.x;
        this._c *= scale.x;
        this._b *= scale.y;
        this._d *= scale.y;
        if (center)
            this.translate(center.negate());
        this._changed();
        return this;
    },

    translate: function(point) {
        point = Point.read(arguments);
        var x = point.x,
            y = point.y;
        this._tx += x * this._a + y * this._b;
        this._ty += x * this._c + y * this._d;
        this._changed();
        return this;
    },

    getPointAddress: function(x, y){
        return {
            a: this._tx + x * this._a + y * this._b,
            b: this._ty + x * this._c + y * this._d
        }
    },

    rotate: function(angle, center) {
        center = Point.read(arguments, 1);
        angle = angle * Math.PI / 180;
        var x = center.x,
            y = center.y,
            cos = Math.cos(angle),
            sin = Math.sin(angle),
            tx = x - x * cos + y * sin,
            ty = y - x * sin - y * cos,
            a = this._a,
            b = this._b,
            c = this._c,
            d = this._d;
        this._a = cos * a + sin * b;
        this._b = -sin * a + cos * b;
        this._c = cos * c + sin * d;
        this._d = -sin * c + cos * d;
        this._tx += tx * a + ty * b;
        this._ty += tx * c + ty * d;
        this._changed();
        return this;
    },

    shear: function() {
        var point = Point.read(arguments),
            center = Point.read(arguments, 0, 0, { readNull: true });
        if (center)
            this.translate(center);
        var a = this._a,
            c = this._c;
        this._a += point.y * this._b;
        this._c += point.y * this._d;
        this._b += point.x * a;
        this._d += point.x * c;
        if (center)
            this.translate(center.negate());
        this._changed();
        return this;
    },

    concatenate: function(mx) {
        var a = this._a,
            b = this._b,
            c = this._c,
            d = this._d;
        this._a = mx._a * a + mx._c * b;
        this._b = mx._b * a + mx._d * b;
        this._c = mx._a * c + mx._c * d;
        this._d = mx._b * c + mx._d * d;
        this._tx += mx._tx * a + mx._ty * b;
        this._ty += mx._tx * c + mx._ty * d;
        this._changed();
        return this;
    },

    preConcatenate: function(mx) {
        var a = this._a,
            b = this._b,
            c = this._c,
            d = this._d,
            tx = this._tx,
            ty = this._ty;
        this._a = mx._a * a + mx._b * c;
        this._b = mx._a * b + mx._b * d;
        this._c = mx._c * a + mx._d * c;
        this._d = mx._c * b + mx._d * d;
        this._tx = mx._a * tx + mx._b * ty + mx._tx;
        this._ty = mx._c * tx + mx._d * ty + mx._ty;
        this._changed();
        return this;
    },

    isIdentity: function() {
        return this._a === 1 && this._c === 0 && this._b === 0 && this._d === 1
            && this._tx === 0 && this._ty === 0;
    },

    isInvertible: function() {
        return !!this._getDeterminant();
    },

    isSingular: function() {
        return !this._getDeterminant();
    },

    transform: function( src, srcOffset, dst, dstOffset, count) {
        return arguments.length < 5
            ? this._transformPoint(Point.read(arguments))
            : this._transformCoordinates(src, srcOffset, dst, dstOffset, count);
    },

    _transformPoint: function(point, dest, _dontNotify) {
        var x = point.x,
            y = point.y;
        if (!dest)
            dest = new Point();
        return dest.set(
            x * this._a + y * this._b + this._tx,
            x * this._c + y * this._d + this._ty,
            _dontNotify
        );
    },

    _transformCoordinates: function(src, srcOffset, dst, dstOffset, count) {
        var i = srcOffset,
            j = dstOffset,
            max = i + 2 * count;
        while (i < max) {
            var x = src[i++],
                y = src[i++];
            dst[j++] = x * this._a + y * this._b + this._tx;
            dst[j++] = x * this._c + y * this._d + this._ty;
        }
        return dst;
    },

    _transformCorners: function(rect) {
        var x1 = rect.x,
            y1 = rect.y,
            x2 = x1 + rect.width,
            y2 = y1 + rect.height,
            coords = [ x1, y1, x2, y1, x2, y2, x1, y2 ];
        return this._transformCoordinates(coords, 0, coords, 0, 4);
    },

    _transformBounds: function(bounds, dest, _dontNotify) {
        var coords = this._transformCorners(bounds),
            min = coords.slice(0, 2),
            max = coords.slice();
        for (var i = 2; i < 8; i++) {
            var val = coords[i],
                j = i & 1;
            if (val < min[j])
                min[j] = val;
            else if (val > max[j])
                max[j] = val;
        }
        if (!dest)
            dest = new Rectangle();
        return dest.set(min[0], min[1], max[0] - min[0], max[1] - min[1],
            _dontNotify);
    },

    inverseTransform: function() {
        return this._inverseTransform(Point.read(arguments));
    },

    _getDeterminant: function() {
        var det = this._a * this._d - this._b * this._c;
        return isFinite(det) && !Numerical.isZero(det)
            && isFinite(this._tx) && isFinite(this._ty)
            ? det : null;
    },

    _inverseTransform: function(point, dest, _dontNotify) {
        var det = this._getDeterminant();
        if (!det)
            return null;
        var x = point.x - this._tx,
            y = point.y - this._ty;
        if (!dest)
            dest = new Point();
        return dest.set(
            (x * this._d - y * this._b) / det,
            (y * this._a - x * this._c) / det,
            _dontNotify
        );
    },

    decompose: function() {
        var a = this._a, b = this._b, c = this._c, d = this._d;
        if (Numerical.isZero(a * d - b * c))
            return null;

        var scaleX = Math.sqrt(a * a + b * b);
        a /= scaleX;
        b /= scaleX;

        var shear = a * c + b * d;
        c -= a * shear;
        d -= b * shear;

        var scaleY = Math.sqrt(c * c + d * d);
        c /= scaleY;
        d /= scaleY;
        shear /= scaleY;

        if (a * d < b * c) {
            a = -a;
            b = -b;
            shear = -shear;
            scaleX = -scaleX;
        }

        return {
            translation: this.getTranslation(),
            scaling: new Point(scaleX, scaleY),
            rotation: -Math.atan2(b, a) * 180 / Math.PI,
            shearing: shear
        };
    },

    getValues: function() {
        return [ this._a, this._c, this._b, this._d, this._tx, this._ty ];
    },

    getTranslation: function() {
        return new Point(this._tx, this._ty);
    },

    setTranslation: function() {
        var point = Point.read(arguments);
        this._tx = point.x;
        this._ty = point.y;
        this._changed();
    },

    getScaling: function() {
        return (this.decompose() || {}).scaling;
    },

    setScaling: function() {
        var scaling = this.getScaling();
        if (scaling != null) {
            var scale = Point.read(arguments);
            (this._owner || this).scale(
                scale.x / scaling.x, scale.y / scaling.y);
        }
    },

    getRotation: function() {
        return (this.decompose() || {}).rotation;
    },

    setRotation: function(angle) {
        var rotation = this.getRotation();
        if (rotation != null)
            (this._owner || this).rotate(angle - rotation);
    },

    inverted: function() {
        var det = this._getDeterminant();
        return det && new Matrix(
            this._d / det,
            -this._c / det,
            -this._b / det,
            this._a / det,
            (this._b * this._ty - this._d * this._tx) / det,
            (this._c * this._tx - this._a * this._ty) / det);
    },

    shiftless: function() {
        return new Matrix(this._a, this._c, this._b, this._d, 0, 0);
    },

    applyToContext: function(ctx) {
        ctx.transform(this._a, this._c, this._b, this._d, this._tx, this._ty);
    }
};