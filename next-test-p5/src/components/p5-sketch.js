"use client"
import React, {useState, useEffect} from "react";
import { NextReactP5Wrapper } from "@p5-wrapper/next";

function sketch(p5) {
  let rotation = 0;
  let canvasWidth = 200;
  let canvasHeight = 200;

  p5.setup = () => p5.createCanvas(canvasWidth, canvasHeight, p5.WEBGL);

  p5.updateWithProps = props => {
    if (props.rotation) {
      rotation = (props.rotation * Math.PI) / 180;
    }

    if (props.width) {
      canvasWidth = props.width

    }

    if (props.height) {
      canvasHeight = props.height
    }
  };

  p5.draw = () => {
    p5.background(100);
    p5.normalMaterial();
    p5.noStroke();
    p5.push();
    p5.rotateY(rotation);
    p5.box(100);
    p5.pop();
  };
}


function P5Sketch() {

  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setRotation(rotation => rotation + 100),
      100
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <NextReactP5Wrapper sketch={sketch} rotation={rotation}/>;
}

export default P5Sketch;