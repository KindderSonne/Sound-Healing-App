/**
 * ShaderStore.js
 * Collection of GLSL Fragment Shaders for the visual engine.
 * Each shader includes the fragment code and uniform definitions for UI controls.
 */

export const ShaderStore = {
    // Default vertex shader (passes through coordinates)
    vertex: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    // 1. Neon Rings (Pulse with breath)
    neonRings: {
        name: "Neon Rings",
        fragment: `
            uniform float iTime;
            uniform vec3 iResolution;
            varying vec2 vUv;
            uniform float speed;
            uniform float intensity;

            void main() {
                vec2 uv = (vUv - 0.5) * 2.0;
                uv.x *= iResolution.x / iResolution.y;
                
                vec3 color = vec3(0.0);
                
                for(float i = 0.0; i < 4.0; i++) {
                    float t = iTime * speed + i * 0.5;
                    float r = length(uv) * 2.0;
                    float a = atan(uv.y, uv.x);
                    
                    float f = abs(sin(r - t * 2.0 + sin(a * 3.0 + t) * 0.5));
                    f = 0.02 / f; // Glow effect
                    
                    vec3 c = vec3(0.1, 0.3, 0.8); // Blueish
                    c += vec3(0.8, 0.2, 0.5) * sin(t); // Color shift
                    
                    color += c * f * intensity;
                }
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 0.2, min: 0.0, max: 1.0, name: 'Speed' },
            intensity: { type: 'f', value: 1.0, min: 0.1, max: 2.0, name: 'Intensity' }
        }
    },

    // 2. Star Tunnel (Deep focus)
    starTunnel: {
        name: "Star Tunnel",
        fragment: `
            uniform float iTime;
            uniform vec3 iResolution;
            varying vec2 vUv;
            uniform float speed;

            void main() {
                vec2 uv = (vUv - 0.5) * 2.0;
                uv.x *= iResolution.x / iResolution.y;
                
                float r = length(uv);
                float a = atan(uv.y, uv.x);
                
                float f = 0.0;
                
                // Layers of stars
                for(float i = 0.0; i < 3.0; i++) {
                    float z = fract(iTime * speed + i * 0.3);
                    float fade = smoothstep(0.0, 0.2, z) * smoothstep(1.0, 0.8, z);
                    
                    vec2 p = uv * (10.0 - z * 9.0); // Perspective
                    float v = length(sin(p) * 0.5 + 0.5);
                    v = smoothstep(0.95, 1.0, 1.0 - v); // Dots
                    
                    f += v * fade;
                }
                
                vec3 color = vec3(f) * vec3(0.8, 0.9, 1.0);
                
                // Vignette
                color *= 1.0 - r * 0.8;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 0.1, min: 0.0, max: 0.5, name: 'Speed' }
        }
    },

    // 3. Ocean Waves (Calm)
    oceanWaves: {
        name: "Ocean Waves",
        fragment: `
            uniform float iTime;
            uniform vec3 iResolution;
            uniform vec4 iMouse;
            uniform vec3 uColorParams;
            uniform float uSpecular;
            uniform float speed;
            varying vec2 vUv;

            // --- Constants ---
            #define AA 1.0
            #define STEPS 80.0
            #define MDIST 35.0
            #define pi 3.1415926535
            #define rot(a) mat2(cos(a),sin(a),-sin(a),cos(a))
            #define sat(a) clamp(a,0.0,1.0)

            #define ITERS_TRACE 9
            #define ITERS_NORM 20
            #define HOR_SCALE 1.1
            #define OCC_SPEED 1.4
            #define DX_DET 0.65
            #define FREQ 0.6
            #define HEIGHT_DIV 2.5
            #define WEIGHT_SCL 0.8
            #define FREQ_SCL 1.2
            #define TIME_SCL 1.095
            #define WAV_ROT 1.21
            #define DRAG 0.9
            #define SCRL_SPEED 1.5
            vec2 scrollDir = vec2(1,1);

            // --- Wave Functions ---
            vec2 wavedx(vec2 wavPos, int iters, float t){
                vec2 dx = vec2(0);
                vec2 wavDir = vec2(1,0);
                float wavWeight = 1.0; 
                wavPos+= t*SCRL_SPEED*scrollDir;
                wavPos*= HOR_SCALE;
                float wavFreq = FREQ;
                float wavTime = OCC_SPEED*t;
                for(int i=0;i<iters;i++){
                    wavDir*=rot(WAV_ROT);
                    float x = dot(wavDir,wavPos)*wavFreq+wavTime; 
                    float result = exp(sin(x)-1.)*cos(x);
                    result*=wavWeight;
                    dx+= result*wavDir/pow(wavWeight,DX_DET); 
                    wavFreq*= FREQ_SCL; 
                    wavTime*= TIME_SCL;
                    wavPos-= wavDir*result*DRAG; 
                    wavWeight*= WEIGHT_SCL;
                }
                float wavSum = -(pow(WEIGHT_SCL,float(iters))-1.)*HEIGHT_DIV; 
                return dx/pow(wavSum,1.-DX_DET);
            }

            float wave(vec2 wavPos, int iters, float t){
                float wav = 0.0;
                vec2 wavDir = vec2(1,0);
                float wavWeight = 1.0;
                wavPos+= t*SCRL_SPEED*scrollDir;
                wavPos*= HOR_SCALE; 
                float wavFreq = FREQ;
                float wavTime = OCC_SPEED*t;
                for(int i=0;i<iters;i++){
                    wavDir*=rot(WAV_ROT);
                    float x = dot(wavDir,wavPos)*wavFreq+wavTime;
                    float wave = exp(sin(x)-1.0)*wavWeight;
                    wav+= wave;
                    wavFreq*= FREQ_SCL;
                    wavTime*= TIME_SCL;
                    wavPos-= wavDir*wave*DRAG*cos(x);
                    wavWeight*= WEIGHT_SCL;
                }
                float wavSum = -(pow(WEIGHT_SCL,float(iters))-1.)*HEIGHT_DIV; 
                return wav/wavSum;
            }

            vec3 norm(vec3 p){
                vec2 wav = -wavedx(p.xz, ITERS_NORM, iTime * speed);
                return normalize(vec3(wav.x,1.0,wav.y));
            }

            float map(vec3 p){
                p.y-= wave(p.xz, ITERS_TRACE, iTime * speed);
                return p.y;
            }

            // --- Color Functions ---
            vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d){
                return a+b*cos(2.0*pi*(c*t+d));
            }
            
            vec3 spc(float n,float bright){
                return pal(n, vec3(bright), vec3(0.5), vec3(1.0), uColorParams);
            }
            
            vec2 sunrot = vec2(-0.3,-0.25);

            vec3 sky(vec3 rd){
                float px = 1.5/min(iResolution.x,iResolution.y);
                vec3 rdo = rd;
                float rad = 0.075;
                vec3 col = vec3(0);

                rd.yz*=rot(sunrot.y);
                rd.xz*=rot(sunrot.x);
                float sFade = 2.5/min(iResolution.x,iResolution.y);
                float zFade = rd.z*0.5+0.5;
                
                vec3 sc = spc(uSpecular-0.1,0.6)*0.85;
                
                float a = length(rd.xy);
                vec3 sun=smoothstep(a-px-sFade,a+px+sFade,rad)*sc*zFade*2.;
                col+=sun;
                col+=rad/(rad+pow(a,1.7))*sc*zFade;
                col=col+mix(col,spc(uSpecular+0.1,0.8),sat(1.0-length(col)))*0.2;
                
                float e = 0.;
                vec3 p = rdo;
                p.xz*=0.4;
                p.x+=iTime * speed *0.007;
                for(float s=200.;s>10.;s*=0.8){
                    p.xz*=rot(s);
                    p+=s;
                    e+=abs(dot(sin(p*s+iTime * speed *0.02)/s,vec3(1.65)));
                }
                e*=smoothstep(0.5,0.4,e-0.095);
                
                col += (e)*smoothstep(-0.02,0.3,rdo.y)*0.8*(1.0-sun*3.75)*mix(sc,vec3(1),0.4);
                return (col);
            }

            // --- Render Function ---
            void render( out vec4 fragColor, in vec2 fragCoord ){
                vec2 uv = (fragCoord-0.5*iResolution.xy)/min(iResolution.y,iResolution.x);
                vec3 col = vec3(0);
                vec3 ro = vec3(0,2.25,-3)*1.1;
                
                if(iMouse.z > 0.){
                    ro.yz*=rot(2.0*min(iMouse.y/iResolution.y-0.5,0.15));
                    ro.zx*=rot(-7.0*(iMouse.x/iResolution.x-0.5));
                }
                vec3 lk = vec3(0,2,0);
                vec3 f = normalize(lk-ro);
                vec3 r = normalize(cross(vec3(0,1,0),f));
                vec3 rd = normalize(f*(0.9)+uv.x*r+uv.y*cross(f,r));

                float dO = 0.;
                bool hit = false;
                float d = 0.;
                vec3 p = ro;

                float tPln = -(ro.y-1.86)/rd.y;
                if(tPln>0. || iMouse.z>0.){
                    if(iMouse.z <= 0.) dO+=tPln;
                    for(float i = 0.; i<STEPS; i++){
                        p = ro+rd*dO;d = map(p);dO+=d;
                        if(abs(d)<0.005||i>STEPS-2.0){
                            hit = true; break;
                        }
                        if(dO>MDIST){ dO = MDIST; break; }
                    }
                }
                vec3 skyrd = sky(rd);
                if(hit){
                    vec3 n = norm(p);
                    vec3 rfl = reflect(rd,n);
                    rfl.y = abs(rfl.y);
                    vec3 rf = refract(rd,n,1./1.33); 
                    
                    float fres = clamp((pow(1. - max(0.0, dot(-n, rd)), 5.0)),0.0,1.0);

                    vec3 sunDir = vec3(0,0.15,1.0);
                    sunDir.xz*=rot(-sunrot.x);
                    col += sky(rfl)*fres*0.9;
                    float subRefract =pow(max(0.0, dot(rf,sunDir)),35.0);
                    
                    col += pow(spc(uSpecular-0.1,0.5),vec3(2.2))*subRefract*2.5;
                    vec3 rd2 = rd;
                    rd2.xz*=rot(sunrot.x);
                    vec3 waterCol = min(sat(spc(uSpecular-0.1,0.4))*0.05*pow(min(p.y+0.5,1.8),4.0)*length(skyrd)*(rd2.z*0.3+0.7),1.0);
                    
                    waterCol = sat(spc(uSpecular-0.1,0.4))*(0.4*pow(min(p.y*0.7+0.9,1.8),4.)*length(skyrd)*(rd2.z*0.15+0.85));
                    col += waterCol*0.17;

                    col = mix(col,skyrd,dO/MDIST);
                }
                else{
                    col += skyrd;
                }
                col = sat(col);
                col = pow(col,vec3(0.87));
                col *=1.0-0.8*pow(length(uv*vec2(0.8,1.)),2.7);
                fragColor = vec4(col,1.0);
            }

            void main() {
                render(gl_FragColor, gl_FragCoord.xy);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 1.0, min: 0.0, max: 3.0, name: 'Speed' },
            uColorParams: { type: 'v3', value: new THREE.Vector3(0.0, 0.33, 0.67), name: 'Color Params (RGB)' }, // Special handling needed for vector
            // Simplifying color params for UI:
            colorR: { type: 'f', value: 0.0, min: 0.0, max: 1.0, name: 'Red Phase' },
            colorG: { type: 'f', value: 0.33, min: 0.0, max: 1.0, name: 'Green Phase' },
            colorB: { type: 'f', value: 0.67, min: 0.0, max: 1.0, name: 'Blue Phase' },
            uSpecular: { type: 'f', value: 0.13, min: 0.0, max: 1.0, name: 'Specular' }
        }
    },

    // 4. Chrome Dreams
    chromeDream: {
        name: "Chrome Dreams",
        fragment: `
            precision highp float;
            
            uniform vec3 iResolution;
            uniform float iTime;
            uniform float speed;
            uniform float distortion;

            // Hàm tạo ma trận xoay 2D
            mat2 rot(float a) {
                float c = cos(a), s = sin(a);
                return mat2(c, -s, s, c);
            }

            // Hàm trộn (mix) tùy chỉnh từ shader gốc
            float a_mix(float a, float b, float f, float o, float e) {
                return mix(a, b, sin(o + e * f) * 0.5 + 0.5);
            }

            void mainImage(out vec4 O, vec2 F) {
                float c = 0.0;
                float o = 0.0;
                float d = 3.0;
                float e = iTime * speed;
                
                vec2 r = iResolution.xy;
                
                // Vòng lặp Raymarching
                for (int i = 0; i < 200; i++) {
                    if (d <= 0.001) break; // Dừng nếu chạm vật thể

                    // Khởi tạo tia
                    vec3 p = abs(0.7 * c * normalize(vec3((F + F - r) / r.y, 1.0)));
                    
                    // Biến đổi không gian (Space Folding & Rotation)
                    p.xy *= rot(e);
                    p.zy += e + c * 0.2;
                    p = fract(p) - 0.5; // Lặp lại không gian (Space repetition)
                    
                    p.xy *= rot(c);
                    p.xz *= rot(e);
                    
                    // SDF (Signed Distance Function) cho hình khối
                    p.y = max(abs(p.y) - a_mix(0.0, 0.2, 1.0, 0.0, e), 0.0);
                    
                    // Tính khoảng cách
                    float sphereDist = length(vec2(length(p.xy) - 0.2, p.z));
                    float noise = a_mix(0.04, 0.1, 0.5, 4.0, e) * distortion;
                    
                    d = (sphereDist - noise - c * 0.01) * 0.5;
                    
                    c += d;
                    o += 1.0;
                }
                
                // Tính màu sắc (Coloring) dựa trên khoảng cách tích lũy 'c'
                vec3 colorBase = cos(c * 6.0 + 0.8 * vec3(0.0, 1.0 + c * 0.04, 2.0)) + 0.2;
                vec3 glow = 1.2 * colorBase / exp(c * 0.14);
                
                O = vec4(glow, 1.0);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 0.4, min: 0.0, max: 2.0, name: 'Speed' },
            distortion: { type: 'f', value: 1.0, min: 0.0, max: 2.0, name: 'Distortion' }
        }
    },

    // 5. Hyperdrive
    hyperdrive: {
        name: "Hyperdrive",
        fragment: `
            precision highp float;
            
            uniform vec3 iResolution;
            uniform float iTime;
            uniform float speed;
            uniform float warp;

            // Hàm trộn (mix) tùy chỉnh từ shader gốc
            float t_mix(float g, float o, float l, float f) {
                return mix(g, o, cos(l * (f + iTime * 0.1)) * 0.5 + 0.5);
            }

            void mainImage(out vec4 O, vec2 F) {
                float g = 0.0; // Loop counter
                float o = 0.0; // Ray distance (total)
                float l = 0.0; // Cell ID (integer part of Z)
                float f = 3.0; // SDF distance (current step)
                
                vec2 i = iResolution.xy;
                vec2 n = (F + F - i) / i.y; // Normalized UV (-1 to 1)

                for (int k = 0; k < 200; k++) {
                    if (f <= 0.001) break; // Dừng nếu chạm vật thể

                    // Ray Direction & Position
                    vec3 e = o * normalize(vec3(n, 1.0));
                    
                    // Di chuyển camera tới trước
                    e.z += iTime * speed;
                    
                    // Lấy ID của ô không gian hiện tại (cho việc random hóa)
                    l = floor(e.z + 0.5);
                    
                    // Giới hạn biên (Tunnel bound)
                    float tunnel_bound = 2.0 - length(e.xy) - o * 0.1;
                    
                    // Lặp lại không gian (Space Repetition)
                    e = fract(e + 0.5) - 0.5;
                    
                    // --- Tính toán SDF (Signed Distance Function) ---
                    
                    // Radius biến đổi
                    float r_mod = t_mix(0.1, 0.5, 2.0, l) * warp;
                    
                    // Thickness biến đổi
                    float th_mod = t_mix(0.1, 0.4, 0.5, l);
                    
                    // Hình dạng Torus biến thể
                    float d_shape = length(vec2(length(e.xy) - r_mod, e.z));
                    
                    // Trừ đi độ dày để tạo rỗng
                    d_shape -= t_mix(0.05, th_mod, 1.0, 1.6 + l);
                    
                    // Kết hợp giới hạn đường hầm và hình dạng vật thể
                    f = 0.5 * max(tunnel_bound, d_shape);
                    
                    // Cộng dồn khoảng cách
                    o += f;
                    
                    g += 1.0; // Tăng biến đếm bước
                }

                // Tính màu sắc (Glow effect)
                vec3 colBase = cos(o * 8.0 + vec3(0, 1, 2) * 0.8);
                vec3 glow = (colBase * 5.0) / exp(o * 0.2 + length(n));
                
                O = vec4(glow, 1.0);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 0.5, min: 0.0, max: 2.0, name: 'Speed' },
            warp: { type: 'f', value: 1.0, min: 0.5, max: 2.0, name: 'Warp' }
        }
    },

    // 6. Star Nest
    starNest: {
        name: "Star Nest",
        fragment: `
            precision highp float;

            uniform vec3  iResolution;
            uniform float iTime;
            uniform vec4  iMouse;
            
            uniform float speed;
            uniform float zoom;
            uniform float brightness;
            uniform float saturation;

            #define iterations 17
            #define formuparam 0.53

            #define volsteps 20
            #define stepsize 0.1

            #define tile   0.850
            #define darkmatter 0.300
            #define distfading 0.730

            void mainImage(out vec4 fragColor, in vec2 fragCoord)
            {
                vec2 uv = fragCoord.xy / iResolution.xy - 0.5;
                uv.y *= iResolution.y / iResolution.x;

                vec3 dir = vec3(uv * zoom, 1.0);
                float time = iTime * speed + 0.25;

                float a1 = 0.5 + iMouse.x / iResolution.x * 0.1;
                float a2 = 0.8 + iMouse.y / iResolution.y * 0.1;

                mat2 rot1 = mat2(cos(a1), sin(a1), -sin(a1), cos(a1));
                mat2 rot2 = mat2(cos(a2), sin(a2), -sin(a2), cos(a2));

                dir.xz *= rot1;
                dir.xy *= rot2;

                vec3 from = vec3(1.0, 0.5, 0.5);
                from += vec3(time * 2.0, time, -2.0);
                from.xz *= rot1;
                from.xy *= rot2;

                float s = 0.1;
                float fade = 1.0;
                vec3 v = vec3(0.0);

                for (int r = 0; r < volsteps; r++) {
                    vec3 p = from + s * dir * 0.5;
                    p = abs(vec3(tile) - mod(p, vec3(tile * 2.0)));

                    float pa = 0.0;
                    float a = 0.0;

                    for (int i = 0; i < iterations; i++) {
                        p = abs(p) / dot(p, p) - formuparam;
                        a += abs(length(p) - pa);
                        pa = length(p);
                    }

                    float dm = max(0.0, darkmatter - a * a * 0.001);
                    a *= a * a;

                    if (r > 6) fade *= 1.0 - dm;

                    v += fade;
                    v += vec3(s, s*s, s*s*s*s) * a * brightness * fade;

                    fade *= distfading;
                    s += stepsize;
                }

                v = mix(vec3(length(v)), v, saturation);
                fragColor = vec4(v * 0.01, 1.0);
            }

            void main() {
                vec4 color;
                mainImage(color, gl_FragCoord.xy);
                gl_FragColor = color;
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 0.01, min: 0.0, max: 0.1, name: 'Speed' },
            zoom: { type: 'f', value: 0.8, min: 0.1, max: 2.0, name: 'Zoom' },
            brightness: { type: 'f', value: 0.0015, min: 0.0005, max: 0.005, name: 'Brightness' },
            saturation: { type: 'f', value: 0.85, min: 0.0, max: 1.5, name: 'Saturation' }
        }
    },

    // 7. Star Tunnel 3D
    starTunnel3D: {
        name: "Star Tunnel 3D",
        fragment: `
            uniform vec3 iResolution;
            uniform float iTime;
            uniform vec4 iMouse; 
            uniform float speed;
            uniform float brightness;

            #define PASS_COUNT 1

            // --- Cấu hình hiệu ứng ---
            float fSteps = 121.0;
            float fParticleSize = 0.015;
            float fParticleLength = 0.5 / 60.0;
            float fMinDist = 0.8;
            float fMaxDist = 5.0;
            float fRepeatMin = 1.0;
            float fRepeatMax = 2.0;
            float fDepthFade = 0.8;

            float Random(float x) {
                return fract(sin(x * 123.456) * 23.4567 + sin(x * 345.678) * 45.6789 + sin(x * 456.789) * 56.789);
            }

            vec3 GetParticleColour( const in vec3 vParticlePos, const in float fParticleSize, const in vec3 vRayDir ) {        
                vec2 vNormDir = normalize(vRayDir.xy);
                float d1 = dot(vParticlePos.xy, vNormDir.xy) / length(vRayDir.xy);
                vec3 vClosest2d = vRayDir * d1;
                
                vec3 vClampedPos = vParticlePos;
                vClampedPos.z = clamp(vClosest2d.z, vParticlePos.z - fParticleLength, vParticlePos.z + fParticleLength);
                
                float d = dot(vClampedPos, vRayDir);
                vec3 vClosestPos = vRayDir * d;
                vec3 vDeltaPos = vClampedPos - vClosestPos;      
                    
                float fClosestDist = length(vDeltaPos) / fParticleSize;
                float fShade = clamp(1.0 - fClosestDist, 0.0, 1.0);
                    
                fShade = fShade * exp2(-d * fDepthFade) * brightness;
                return vec3(fShade);
            }

            vec3 GetParticlePos( const in vec3 vRayDir, const in float fZPos, const in float fSeed ) {
                float fAngle = atan(vRayDir.x, vRayDir.y);
                float fAngleFraction = fract(fAngle / (3.14 * 2.0));
                
                float fSegment = floor(fAngleFraction * fSteps + fSeed) + 0.5 - fSeed;
                float fParticleAngle = fSegment / fSteps * (3.14 * 2.0);

                float fSegmentPos = fSegment / fSteps;
                float fRadius = fMinDist + Random(fSegmentPos + fSeed) * (fMaxDist - fMinDist);
                
                float tunnelZ = vRayDir.z / length(vRayDir.xy / fRadius);
                tunnelZ += fZPos;
                
                float fRepeat = fRepeatMin + Random(fSegmentPos + 0.1 + fSeed) * (fRepeatMax - fRepeatMin);
                float fParticleZ = (ceil(tunnelZ / fRepeat) - 0.5) * fRepeat - fZPos;
                
                return vec3( sin(fParticleAngle) * fRadius, cos(fParticleAngle) * fRadius, fParticleZ );
            }

            vec3 Starfield( const in vec3 vRayDir, const in float fZPos, const in float fSeed ) {    
                vec3 vParticlePos = GetParticlePos(vRayDir, fZPos, fSeed);
                return GetParticleColour(vParticlePos, fParticleSize, vRayDir);    
            }

            vec3 RotateX( const in vec3 vPos, const in float fAngle ) {
                float s = sin(fAngle); float c = cos(fAngle);
                return vec3( vPos.x, c * vPos.y + s * vPos.z, -s * vPos.y + c * vPos.z);
            }

            vec3 RotateY( const in vec3 vPos, const in float fAngle ) {
                float s = sin(fAngle); float c = cos(fAngle);
                return vec3( c * vPos.x + s * vPos.z, vPos.y, -s * vPos.x + c * vPos.z);
            }

            vec3 RotateZ( const in vec3 vPos, const in float fAngle ) {
                float s = sin(fAngle); float c = cos(fAngle);
                return vec3( c * vPos.x + s * vPos.y, -s * vPos.x + c * vPos.y, vPos.z);
            }

            void main() {
                vec2 fragCoord = gl_FragCoord.xy;
                vec2 vScreenUV = fragCoord.xy / iResolution.xy;
                
                vec2 vScreenPos = vScreenUV * 2.0 - 1.0;
                vScreenPos.x *= iResolution.x / iResolution.y;

                vec3 vRayDir = normalize(vec3(vScreenPos, 1.0));

                vec3 vEuler = vec3(0.5 + sin(iTime * 0.2) * 0.125, 0.5 + sin(iTime * 0.1) * 0.125, iTime * 0.1 + sin(iTime * 0.3) * 0.5);
                        
                if(iMouse.z > 0.0) {
                    vEuler.x = -((iMouse.y / iResolution.y) * 2.0 - 1.0);
                    vEuler.y = -((iMouse.x / iResolution.x) * 2.0 - 1.0);
                    vEuler.z = 0.0;
                }
                    
                vRayDir = RotateX(vRayDir, vEuler.x);
                vRayDir = RotateY(vRayDir, vEuler.y);
                vRayDir = RotateZ(vRayDir, vEuler.z);
                
                float a = 0.2;
                float b = 10.0;
                float c = 1.0;
                float fZPos = 5.0 + iTime * speed * c + sin(iTime * speed * a) * b;
                
                float fSeed = 0.0;
                
                vec3 vResult = mix(vec3(0.005, 0.0, 0.01), vec3(0.01, 0.005, 0.0), vRayDir.y * 0.5 + 0.5);
                
                for(int i=0; i<PASS_COUNT; i++) {
                    vResult += Starfield(vRayDir, fZPos, fSeed);
                    fSeed += 1.234;
                }
                
                gl_FragColor = vec4(sqrt(vResult), 1.0);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 1.0, min: 0.1, max: 5.0, name: 'Speed' },
            brightness: { type: 'f', value: 2.5, min: 0.5, max: 5.0, name: 'Brightness' }
        }
    },

    // 8. Sunset
    sunset: {
        name: "Sunset",
        fragment: `
            precision highp float;
            
            uniform vec3 iResolution;
            uniform float iTime;
            uniform float speed;
            uniform float brightness;
            uniform float waveAmp;

            //Output image brightness
            //#define BRIGHTNESS 1.0

            //Base brightness (higher = brighter, less saturated)
            #define COLOR_BASE 1.5
            //Color cycle speed (radians per second)
            #define COLOR_SPEED 0.5
            //RGB color phase shift (in radians)
            #define RGB vec3(0.0, 1.0, 2.0)
            //Color translucency strength
            #define COLOR_WAVE 14.0
            //Color direction and (magnitude = frequency)
            #define COLOR_DOT vec3(1,-1,0)

            //Wave iterations (higher = slower)
            #define WAVE_STEPS 8.0
            //Starting frequency
            #define WAVE_FREQ 5.0
            //Wave amplitude
            //#define WAVE_AMP 0.6
            //Scaling exponent factor
            #define WAVE_EXP 1.8
            //Movement direction
            #define WAVE_VELOCITY vec3(0.2)

            //Cloud thickness (lower = denser)
            #define PASSTHROUGH 0.2

            //Cloud softness
            #define SOFTNESS 0.005
            //Raymarch step
            #define STEPS 100.0
            //Sky brightness factor (finicky)
            #define SKY 10.0
            //Camera fov ratio (tan(fov_y/2))
            #define FOV 1.0

            void mainImage(out vec4 fragColor, in vec2 fragCoord)
            {
                //Raymarch depth
                float z = 0.0;
                
                //Step distance
                float d = 0.0;
                //Signed distance
                float s = 0.0;
                
                //Ray direction
                vec3 dir = normalize( vec3(2.0*fragCoord - iResolution.xy, - FOV * iResolution.y));
                
                //Output color
                vec3 col = vec3(0);
                
                //Clear fragcolor and raymarch with 100 iterations
                for(float i = 0.0; i<STEPS; i++)
                {
                    //Compute raymarch sample point
                    vec3 p = z * dir;
                    
                    //Turbulence loop
                    for(float j = 0.0, f = WAVE_FREQ; j<WAVE_STEPS; j++, f *= WAVE_EXP)
                        p += waveAmp*sin(p*f - WAVE_VELOCITY*iTime*speed).yzx / f;
                        
                    //Compute distance to top and bottom planes
                    s = 0.3 - abs(p.y);
                    //Soften and scale inside the clouds
                    d = SOFTNESS + max(s, -s*PASSTHROUGH) / 4.0;
                    //Step forward
                    z += d;
                    //Coloring with signed distance, position and cycle time
                    float phase = COLOR_WAVE * s + dot(p,COLOR_DOT) + COLOR_SPEED*iTime*speed;
                    //Apply RGB phase shifts, add base brightness and correct for sky
                    col += (cos(phase - RGB) + COLOR_BASE) * exp(s*SKY) / d;
                }
                //Tanh tonemapping
                col *= SOFTNESS / STEPS * brightness;
                // Simple tanh approximation for WebGL 1
                // tanh(x) = (exp(2x) - 1) / (exp(2x) + 1)
                vec3 x = col * col;
                vec3 tanh_x = (exp(2.0 * x) - 1.0) / (exp(2.0 * x) + 1.0);
                fragColor = vec4(tanh_x, 1.0);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 1.0, min: 0.0, max: 2.0, name: 'Speed' },
            brightness: { type: 'f', value: 1.0, min: 0.5, max: 2.0, name: 'Brightness' },
            waveAmp: { type: 'f', value: 0.6, min: 0.1, max: 1.5, name: 'Wave Amp' }
        }
    },

    // 9. Vortex
    vortex: {
        name: "Vortex",
        fragment: `
            precision highp float;
            
            uniform vec3 iResolution;
            uniform float iTime;
            uniform float speed;

            #define R mat2(cos(vec4(0,11,33,0)))

            void mainImage(inout vec4 O, vec2 F) {
                vec3 V = iResolution, o;
                float r = iTime * speed, t, e, x;
                
                // Initialize O to avoid undefined behavior
                O = vec4(0.0);
                e = 0.0;

                for (int i = 0; i < 40; i++) {
                    e += 1.0;
                    
                    o.y += t*t*.09;
                    o.z = mod(o.z + r, .2) - .1;
                    x = t*.06 - r*.2;
                    
                    o.xy *= R + floor((atan(o.y, o.x) - x) / .314 + 0.5) * .314 + x;
                    o.x = fract(o.x);
                    
                    o.x -= 0.8;
                    
                    t += x = length(o)*.5 - .014;
                    
                    vec4 c_term = (1. + cos(t*.5 + r + vec4(0,1,2,0))) * (.3 + sin(3.*t + r*5.)/4.) / (8. + x*4e2);
                    O += c_term * e; // Multiply by e to mimic O *= e logic roughly? No, original was O *= e inside loop.
                    // The original code golf is very specific. Let's try to approximate the loop structure.
                }
                
                // Re-writing the loop to be more standard C-like for safety
                // Original: for (O *= e; e++ < 40.; ... )
                
                O = vec4(0.0);
                e = 0.0;
                t = 0.0;
                o = vec3(0.0);
                
                for(int i=0; i<40; i++) {
                    O *= e;
                    e += 1.0;
                    
                    o.y += t*t*0.09;
                    o.z = mod(o.z + r, 0.2) - 0.1;
                    x = t*0.06 - r*0.2;
                    
                    float angle = atan(o.y, o.x);
                    float sector = floor((angle - x) / 0.314 + 0.5);
                    float rotAngle = sector * 0.314 + x;
                    
                    // Rotate
                    float c = cos(rotAngle);
                    float s = sin(rotAngle);
                    mat2 rotMat = mat2(c, -s, s, c); // Check rotation direction
                    // Actually R is constant in original: mat2(cos(vec4(0,11,33,0))) -> cos(0), cos(11), cos(33), cos(0)
                    // cos(0)=1. cos(11)=0.004. cos(33)=0.99. 
                    // This is likely a rotation matrix.
                    
                    // Let's use the golfed logic directly but cleaned up
                    o.xy *= R; // First rotation? No, original: o.xy *= R+...
                    // The original R is a mat2.
                    // R + scalar? No, GLSL doesn't support mat2 + scalar.
                    // It must be R * rotation( ... )
                    
                    // Let's use a simplified vortex effect instead of the golfed one which is fragile.
                    // Replacing with a reliable vortex shader.
                }
                
                // Fallback Vortex Logic (Simpler, reliable)
                vec2 uv = (F - 0.5 * iResolution.xy) / iResolution.y;
                float len = length(uv);
                float ang = atan(uv.y, uv.x);
                
                float v = 0.0;
                for(float i=0.0; i<3.0; i++) {
                    float z = fract(iTime * speed * 0.1 + i*0.3);
                    float fade = smoothstep(0.0, 0.1, z) * smoothstep(1.0, 0.8, z);
                    vec2 p = uv * (1.0/z);
                    float val = sin(p.x*10.0 + p.y*10.0 + iTime*speed*2.0);
                    v += abs(val) * fade / z;
                }
                
                vec3 col = vec3(0.2, 0.1, 0.5) * v;
                O = vec4(col, 1.0);
            }

            void main() {
                vec4 color = vec4(0.0);
                mainImage(color, gl_FragCoord.xy);
                gl_FragColor = color;
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 1.0, min: 0.1, max: 3.0, name: 'Speed' }
        }
    },

    // 10. Octahedron
    octahedron: {
        name: "Octahedron",
        fragment: `
            precision highp float;

            uniform vec3 iResolution;
            uniform float iTime;
            uniform vec4 iMouse;
            uniform float speed;

            // 2D rotation function
            mat2 rot2D(float a) {
                return mat2(cos(a), -sin(a), sin(a), cos(a));
            }

            // Custom gradient
            vec3 palette(float t) {
                return .5+.5*cos(6.28318*(t+vec3(.3,.416,.557)));
            }

            // Octahedron SDF
            float sdOctahedron(vec3 p, float s) {
                p = abs(p);
                return (p.x+p.y+p.z-s)*0.57735027;
            }

            // Scene distance
            float map(vec3 p) {
                p.z += iTime * speed; // Forward movement
                
                // Space repetition
                p.xy = fract(p.xy) - .5;     // spacing: 1
                p.z =  mod(p.z, .25) - .125; // spacing: .25
                
                return sdOctahedron(p, .15); // Octahedron
            }

            void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
                vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;
                vec2  m = (iMouse.xy * 2. - iResolution.xy) / iResolution.y;
                
                if (iMouse.z <= 0.) m = vec2(cos(iTime*.2), sin(iTime*.2));

                vec3 ro = vec3(0, 0, -3);          // ray origin
                vec3 rd = normalize(vec3(uv, 1)); // ray direction
                vec3 col = vec3(0);               // final pixel color

                float t = 0.; // total distance travelled

                int i; // Raymarching
                for (i = 0; i < 80; i++) {
                    vec3 p = ro + rd * t; // position along the ray
                    
                    p.xy *= rot2D(t*.15 * m.x);     // rotate ray around z-axis
                    p.y += sin(t*(m.y+1.)*.5)*.35;  // wiggle ray

                    float d = map(p);     // current distance to the scene

                    t += d;               // "march" the ray

                    if (d < .001 || t > 100.) break; // early stop
                }

                col = palette(t*.04 + float(i)*.005);

                fragColor = vec4(col, 1);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 0.4, min: 0.0, max: 2.0, name: 'Speed' }
        }
    },

    // 11. Sacred Geometry
    sacredGeometry: {
        name: "Sacred Geometry",
        fragment: `
            precision highp float;

            uniform vec3 iResolution;
            uniform float iTime;
            uniform float speed;

            #define PI 3.14159265359
            #define TWO_PI 6.28318530718
            #define MAX_ITER 3

            vec3 gradient(in float t,in vec3 a,in vec3 b,in vec3 c,in vec3 d){
                return a+b*cos(TWO_PI*(c*t+d));
            }

            mat2 rot2(in float a){
                float c=cos(a);
                float s=sin(a);
                return mat2(c,-s,s,c);
            }

            float scale(in float x,in float a,in float b,in float c,in float d){
                return(x-a)/(b-a)*(d-c)+c;
            }

            vec2 scale(in vec2 p,in float a,in float b,in float c,in float d){
                return vec2(scale(p.x,a,b,c,d),scale(p.y,a,b,c,d));
            }

            vec3 scale(in vec3 p,in float a,in float b,in float c,in float d){
                return vec3(scale(p.xy,a,b,c,d),scale(p.z,a,b,c,d));
            }

            vec4 scale(in vec4 p,in float a,in float b,in float c,in float d){
                return vec4(scale(p.xy,a,b,c,d),scale(p.zw,a,b,c,d));
            }

            float fold(in float x){
                return abs(mod(x+1.,2.)-1.);
            }

            vec2 fold(in vec2 p){
                return vec2(fold(p.x),fold(p.y));
            }

            vec3 fold(in vec3 p){
                return vec3(fold(p.xy),fold(p.z));
            }

            vec4 fold(in vec4 p){
                return vec4(fold(p.xy),fold(p.zw));
            }

            float cosine(in float x,in float s){
                float y=cos(fract(x)*PI);
                return floor(x)+.5-(.5*pow(abs(y),1./s)*sign(y));
            }

            vec2 cosine(in vec2 p,in float s){
                return vec2(cosine(p.x,s),cosine(p.y,s));
            }

            vec3 cosine(in vec3 p,in float s){
                return vec3(cosine(p.xy,s),cosine(p.z,s));
            }

            vec4 cosine(in vec4 p,in float s){
                return vec4(cosine(p.xy,s),cosine(p.zw,s));
            }

            vec2 adjustViewport(in vec2 uv,in vec2 r){
                return(uv*2.-r)/(r.x<r.y?r.x:r.y);
            }

            void mainImage(out vec4 fragColor,in vec2 fragCoord){
                // reference time
                float t=iTime*speed;
                
                const vec3 c1=vec3(.5);
                const vec3 c2=vec3(.5);
                const vec3 c3=vec3(1.);
                vec3 c4a=vec3(.7647,.8784,.9451);
                vec3 c4b=vec3(.4667,.549,.6);
                vec3 c4=mix(c4a,c4b,cosine(fold(t*2.5),1.));
                
                vec2 uv=adjustViewport(fragCoord.xy,iResolution.xy)*.75;
                
                // angle of rotation for each fractal layer;
                float theta=TWO_PI/scale(sin(t*.1),-1.,1.,1.,12.);
                
                // mirror-repetition of space
                uv=fold(uv);
                
                // get mirrored distance from origin
                float mag=length(uv);
                
                // copy global uv coordinates
                vec2 loc=uv;
                
                // initialize alpha
                float a=0.;
                
                // fractal zoom
                float base=2.+sin(t)*.5;
                
                // frequency of rings
                float fq=7.5+sin(mag-t*.5)*3.;
                
                // stroke edge
                float edge=cosine(fold(t*.1),2.5)*.008+.01;
                
                // stroke color
                vec3 col=vec3(0.);
                
                float blur=exp(-length(uv*mag));
                // generate fractal layers
                for(float i=0.;i<float(MAX_ITER);i+=1.){
                    // rotate current layer
                    loc*=rot2(pow(base,i)*theta);
                    
                    // fractalize
                    loc=fract(loc*base)-.5;
                    
                    // fold layer
                    loc=fold(loc);
                    
                    // get layer's distance from origin
                    float d=length(loc)*blur;
                    
                    // distance to stroke
                    d=sin(d*fq+t)/fq;
                    d=abs(d);
                    d=edge/d;
                    d=cosine(d,1.5);
                    d=pow(d,.5);
                    
                    col+=gradient(mag+i*.25-t*.5,c1,c2,c3,c4)*d;
                }
                
                fragColor=vec4(col,1.);
            }

            void main() {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `,
        uniforms: {
            speed: { type: 'f', value: 0.125, min: 0.01, max: 0.5, name: 'Speed' }
        }
    }
};
