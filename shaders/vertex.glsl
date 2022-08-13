varying vec2 vertexUV;
varying vec3 vPos;

// varying vec3 vertexNormal;
varying vec2 vCoordinates;
attribute vec3 aCoordinates;
attribute float aSpeed;
attribute float aOffset;
attribute float aDirection;
attribute float aPress;


uniform float move;
uniform float time;
uniform vec2 mouse;
uniform float mousePressed;
uniform float transition;


void main() {
    vertexUV = uv;
    // vertexNormal = normalize(normalMatrix * normal);
    vec3 pos = position;

    // Unstable

    pos.x += sin(move*aSpeed)*3.;
    pos.y += sin(move)*3.;
    pos.z = mod(position.z + move*20.0 *aSpeed + aOffset, 2000.) - 1000.0;


    vec3 stable = position;
    float dist = distance(stable.xy, mouse);
    float area = 1. - smoothstep(0., 500., dist);

    stable.x +=50.*sin(0.1*time*aPress)*aDirection*area*mousePressed;
    stable.y +=50.*sin(0.1*time*aPress)*aDirection*area*mousePressed;
    stable.z +=200.*cos(0.1*time*aPress)*aDirection*area*mousePressed;

    pos = mix(pos, stable, transition);

    // Stable
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0 );
    gl_PointSize = 4000.0 * (1.0 / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vCoordinates = aCoordinates.xy;
    vPos = pos;
}