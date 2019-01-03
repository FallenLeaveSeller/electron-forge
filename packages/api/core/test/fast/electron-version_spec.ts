import { expect } from 'chai';
import { getElectronVersion, updateElectronDependency } from '../../src/util/electron-version';
import { deps, devDeps, exactDevDeps } from '../../src/api/init-scripts/init-npm';

describe.only('updateElectronDependency', () => {
  it('adds an Electron dep if one does not already exist', () => {
    const packageJSON = { dependencies: {}, devDependencies: {} };
    const [dev, exact] = updateElectronDependency(packageJSON, devDeps, exactDevDeps);
    expect(dev).to.deep.equal(devDeps);
    expect(exact).to.deep.equal(exactDevDeps);
  });
  it('does not add an Electron dep if one already exists', () => {
    const packageJSON = {
      dependencies: {},
      devDependencies: { electron: '0.37.0' },
    };
    const [dev, exact] = updateElectronDependency(packageJSON, devDeps, exactDevDeps);
    expect(dev).to.deep.equal(devDeps);
    expect(exact).to.deep.equal([]);
  });
  it('moves an Electron dependency from dependencies to devDependencies', () => {
    const packageJSON = {
      dependencies: { electron: '0.37.0'},
      devDependencies: { },
    };
    const [dev, exact] = updateElectronDependency(packageJSON, devDeps, exactDevDeps);
    expect(dev.includes('electron@0.37.0')).to.equal(true);
    expect(exact).to.deep.equal([]);
  });
});

describe('getElectronVersion', () => {
  it('fails without devDependencies', () => {
    expect(() => getElectronVersion({})).to.throw('does not have any devDependencies');
  });

  it('fails without electron devDependencies', () => {
    expect(() => getElectronVersion({ devDependencies: {} })).to.throw('Electron packages in devDependencies');
  });

  it('works with electron-prebuilt-compile', () => {
    const packageJSON = {
      devDependencies: { 'electron-prebuilt-compile': '1.0.0' },
    };
    expect(getElectronVersion(packageJSON)).to.be.equal('1.0.0');
  });

  it('works with electron-prebuilt', () => {
    const packageJSON = {
      devDependencies: { 'electron-prebuilt': '1.0.0' },
    };
    expect(getElectronVersion(packageJSON)).to.be.equal('1.0.0');
  });

  it('works with electron', () => {
    const packageJSON = {
      devDependencies: { 'electron': '1.0.0' },
    };
    expect(getElectronVersion(packageJSON)).to.be.equal('1.0.0');
  });
});
