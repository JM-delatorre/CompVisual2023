const REQUIRED_FORCE = 3.5;

class Entity {
  constructor(x, y, radius, mass, { texture = undefined, options = {} } = {}) {
    this.body = Matter.Bodies.circle(x, y, radius, options);
    this.texture = texture;
    this.is_death = false;
    this.body.entity = this;

    Matter.Body.setMass(this.body, mass);
    Matter.World.add(world, this.body);
  }

  show() {
    if (this.is_death) return;

    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    if (this.texture) {
      imageMode(CENTER);
      image(this.texture, 0, 0, this.body.circleRadius * 2, this.body.circleRadius * 2);
    }
    else {
      fill(50, 200, 0);
      noStroke();
      ellipseMode(CENTER);
      ellipse(0, 0, this.body.circleRadius * 2, this.body.circleRadius * 2);
    }
    pop();
  }

  isOffScreen() {
    return this.body.position.y > height + 100 || this.body.position.x < -100 || this.body.position.x > width + 100;
  }
}

class Enemy extends Entity {
  constructor(x, y, rad, mass, health, { texture = undefined } = {}) {
    super(x, y, rad, mass, {
      texture: texture,
      options: {
        label: 'damageable',
        collisionFilter: {
          category: 1
        }
      },
      restitution: 0.5
    });

    this.health = health;

    this.damage_delay = 1000;
    this.required_force = REQUIRED_FORCE;
  }

  hit(collision) {
    const force = Matter.Vector.mult(Matter.Vector.sub(this.body.position, collision.body.position), 0.1);
    const damage = Matter.Vector.magnitude(force);
    if (damage > this.required_force && this.damage_delay <= 0) {
      this.health -= damage;
    }

    if (this.health <= 0 || this.isOffScreen()) {
      this.is_death = true;
      Matter.World.remove(world, this.body);
    }
  }

  doDamage(damage) {
    this.health -= damage;
  }
}

class Bird extends Entity {
  constructor(x, y, rad, mass, { texture = undefined } = {}) {
    super(x, y, rad, mass, {
      texture: texture,
      options: {
        collisionFilter: {
          category: 2
        }
      },
      restitution: 0.5
    });
  }
}

class Structure {
  constructor(x, y, w, h, { rotation = 0, border_texture = undefined, internal_texture = undefined, options = {} } = {}) {
    this.body = Matter.Bodies.rectangle(x, y, w, h, options);
    this.size = createVector(w, h);
    Body.setAngle(this.body, rotation);

    this.is_destroyed = false;
    this.body.entity = this;
    this.textures = {
      border: border_texture,
      internal: internal_texture
    };

    Matter.World.add(world, this.body);
  }

  show() {
    if (this.is_destroyed) return;

    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);

    if (this.textures.internal || this.textures.border) {
      imageMode(CENTER);
      if (this.textures.internal) {
        image(this.textures.internal, 0, 0, this.size.x, this.size.y);
      }
      if (this.textures.border) {
        image(this.textures.border, 0, 0, this.size.x, this.size.y);
      }
    }
    else {
      fill(20, 0, 100);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, this.size.x, this.size.y);
    }
    pop();
  }

  isOffScreen() {
    return this.body.position.y > height + 100 || this.body.position.x < -100 || this.body.position.x > width + 100;
  }
}

class Ground extends Structure {
  constructor(x, y, w, h, { rotation = 0, texture = undefined } = {}) {
    super(x, y, w, h, {
      rotation: rotation,
      border_texture: texture,
      options: {
        isStatic: true
      }
    });
  }
}

class Block extends Structure {
  constructor(x, y, w, h, health, { rotation = 0, border_texture = undefined, internal_texture = undefined, can_explode = false } = {}) {
    super(x, y, w, h, {
      rotation: rotation,
      border_texture: border_texture,
      internal_texture: internal_texture,
      options: {
        label: 'damageable',
        friction: 1,
      }
    });
    this.health = health;
    this.can_explode = can_explode;
    this.is_exploded = false;

    this.damage_delay = 1000;
    this.required_force = REQUIRED_FORCE;
  }

  hit(collision) {
    const force = Matter.Vector.mult(Matter.Vector.sub(this.body.position, collision.body.position), 0.1);
    const damage = Matter.Vector.magnitude(force);
    if (damage > this.required_force && this.damage_delay <= 0) {
      this.health -= damage;
    }

    if (this.health <= 0 || this.isOffScreen()) {
      if (this.can_explode) {
        this.explode();
      }

      this.is_destroyed = true;
      Matter.World.remove(world, this.body);
    }
  }

  doDamage(damage) {
    this.health -= damage;
  }

  explode() {
    if (!this.is_exploded) {
      this.is_exploded = true;
      explosions.push(new Explosion(this.body.position.x, this.body.position.y, 100, 0.8, 100));
      Matter.World.remove(world, this.body);
    }
  }
}

class SlingShot {
  constructor(body, { upper_texture = undefined, lower_texture = undefined } = {}) {
    const options = {
      pointA: {
        x: body.body.position.x,
        y: body.body.position.y
      },
      bodyB: body.body,
      length: 2,
      stiffness: 0.04
    }

    this.sling = Matter.Constraint.create(options);
    this.sling.entity = this;
    this.textures = {
      upper: upper_texture,
      lower: lower_texture
    };

    Matter.World.add(world, this.sling);
  }

  show() {
    push();

    if (this.textures.lower && this.textures.upper) {
      translate(this.sling.pointA.x, this.sling.pointA.y);
      imageMode(CENTER);
      image(this.textures.lower, 10, 50, 60, 120);
    }
    else if (this.sling.bodyB != null) {
      stroke(0);
      strokeWeight(4);
      line(this.sling.pointA.x, this.sling.pointA.y,
        this.sling.bodyB.position.x, this.sling.bodyB.position.y);
    }
    pop();
  }

  show_upper() {
    push();
    translate(this.sling.pointA.x, this.sling.pointA.y);

    if (this.textures.lower && this.textures.upper) {
      imageMode(CENTER);
      image(this.textures.upper, -19, 25, 46, 70);
    }
    pop();
  }

  fly(mConstraint) {
    if (this.sling.bodyB != null
      && mConstraint.mouse.button === -1
      && this.sling.bodyB.position.x > this.sling.pointA.x + 15) {
      this.sling.bodyB.collisionFilter.category = 1;
      this.sling.bodyB = null;
    }
  }

  hasBird() {
    return this.sling.bodyB != null;
  }

  attach(bird) {
    this.sling.bodyB = bird.body;
  }
}

class Explosion {
  constructor(x, y, rad, force, damage) {
    this.position = createVector(x, y);
    this.force = force;
    this.radius = rad;
    this.damage = damage;
    this.is_done = false;
  }

  applyForce(entity) {
    if (this.is_done) return;
  
    const distance = Matter.Vector.magnitude(Matter.Vector.sub(this.position, entity.body.position));
  
    if (distance < this.radius) {
      const direction = Matter.Vector.normalise(Matter.Vector.sub(entity.body.position, this.position));
      const forceMagnitude = this.force * (1 - distance / this.radius);
      const force = Matter.Vector.mult(direction, forceMagnitude);
      Matter.Body.applyForce(entity.body, entity.body.position, force);

      if (entity.body.label == 'damageable') {
        const dealed_damage = this.damage * (1 - distance / this.radius);
        entity.doDamage(dealed_damage);
      }
    }
  }

  update() {
    this.is_done = true;
  }
}