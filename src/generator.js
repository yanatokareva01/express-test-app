/**
 * Created by creed on 30.06.17.
 */
"use strict";

const fs = require('fs');
const path = require('path');
const Q = require('q');
const dataDir = path.join(__dirname, '../data');

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

        const promises = partsData.map((partData, index) => {
            const deferred = Q.defer();
            const partPath = path.join(dataDir, `part${index + 1}.txt`);
            fs.writeFile(partPath, partData.join('\n'), (err, result) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(result);
                }
            });
            return deferred.promise;
        });
        return Q.all(promises);
    },
    clear: () => {
        const outerDeferred = Q.defer();
        fs.readdir(dataDir, (err, files) => {
            if (err) {
                outerDeferred.reject(err);
            } else {
                const promises = [];
                for (const file of files) {
                    const deferred = Q.defer();
                    fs.unlink(path.join(dataDir, file), err => {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            // console.log('unlink', path.join(dataDir, file));
                            deferred.resolve();
                        }
                    });
                    promises.push(deferred.promise);
                }
                outerDeferred.resolve(promises);
            }
        });
        return outerDeferred.promise.then((promises) => {
            return Q.all(promises);
        });
    }
};