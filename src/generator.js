/**
 * Created by creed on 30.06.17.
 */
"use strict";

const path = require('path');
const Q = require('q');
const Segment = require('../models/segment');
const mongoose = require('mongoose');

module.exports = {
    generate: (initialSetSize, minValue, maxValue, countOfParts) => {
        const len = maxValue - minValue + 1;
        const step = Math.floor((len + countOfParts - 1) / countOfParts);

        const ranges = [];
        for(let i = minValue, part = 1; i < maxValue; i += step, part++) {
            ranges.push({
                left: i,
                right: i + step - 1
            });
        }

        const numbers = [];
        for(let i = 0; i < initialSetSize; i++) {
            const number = Math.random() * (maxValue - minValue + 1) + minValue;
            numbers.push(Math.floor(number)|0);
        }

        numbers.sort((a, b) => {
            if (+a < +b) {
                return -1;
            } else if (+a === +b) {
                return 0;
            }
            return 1;
        });
        const partsData = [[]];
        // console.log(numbers);
        for(let i = 0, r = 0; i < numbers.length; i++) {
            if (numbers[i] > ranges[r].right) {
                partsData.push([]);
                r++;
            }
            partsData[r].push(numbers[i]);
            // console.log(numbers[i] + ' goes to part' + (r + 1));
        }

        const promises = partsData.map((numbers, index) => {
	        const part = index + 1;

            return Segment.create({ numbers, part });
        });

        return Q.all(promises);
    },
    clear: () => {
       return Segment.remove({});
    }
};