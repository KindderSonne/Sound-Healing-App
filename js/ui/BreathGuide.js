/**
 * BreathGuide.js
 * Manages the breathing animation (4-7-8 technique).
 */

export class BreathGuide {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.isActive = false;
    }

    /**
     * Toggle breathing guide on/off
     * @param {boolean} active 
     */
    setActive(active) {
        console.log('BreathGuide setActive:', active);
        this.isActive = active;
        if (active) {
            this.element.style.display = 'block';
            console.log('BreathGuide display set to block');
            // Small delay to allow display:block to apply before adding class for transition
            setTimeout(() => {
                this.element.classList.add('active');
                console.log('BreathGuide active class added');
            }, 10);
        } else {
            this.element.classList.remove('active');
            setTimeout(() => {
                this.element.style.display = 'none';
            }, 1000); // Wait for fade out
        }
    }
}
