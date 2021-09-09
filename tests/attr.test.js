const attrOrm = require('../orm/attrOrm');

describe('Modifying Account Attributes', () => {
  /* Test Overview: Goal: to add the following accounts and groups:
     bank,electronics,clothes
     wallet,clothes
     pillow
     cash,electronics,clothes (copied from bank)
  */
  test('Error - Add group to non-existent account', async () => {
    const acc = 'bank';
    const grp = 'electronics';
    try {
      await attrOrm.addGroupToAccount(acc, grp);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* not found/);
    }
  });
  test('Add account', async () => {
    const acc = 'bank';
    try {
      await attrOrm.addAccount(acc);
      const accRb = await attrOrm.getAccount(acc);
      expect(accRb).toEqual(acc);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Error - Add account that already exists', async () => {
    const acc = 'bank';
    try {
      await attrOrm.addAccount(acc);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* already exists/);
    }
  });
  test('Add group to account', async () => {
    const acc = 'bank';
    const grp = 'electronics';
    try {
      await attrOrm.addGroupToAccount(acc, grp);
      const groups = await attrOrm.getGroups(acc);
      expect(groups).toContain(grp);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Error - Add group that already exists', async () => {
    const acc = 'bank';
    const grp = 'electronics';
    try {
      await attrOrm.addGroupToAccount(acc, grp);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* already has group/);
    }
  });
  test('Add another group to account', async () => {
    const acc = 'bank';
    const grp = 'clothes';
    try {
      await attrOrm.addGroupToAccount(acc, grp);
      const groups = await attrOrm.getGroups(acc);
      expect(groups).toContain(grp);
      expect(groups.length).toEqual(2);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Add another account', async () => {
    const acc = 'wallet';
    try {
      await attrOrm.addAccount(acc);
      const accRb = await attrOrm.getAccount(acc);
      expect(accRb).toEqual(acc);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Add another account', async () => {
    const acc = 'pillow';
    try {
      await attrOrm.addAccount(acc);
      const accRb = await attrOrm.getAccount(acc);
      expect(accRb).toEqual(acc);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Add group to account', async () => {
    const acc = 'wallet';
    const grp = 'clothes';
    try {
      await attrOrm.addGroupToAccount(acc, grp);
      const groups = await attrOrm.getGroups(acc);
      expect(groups).toContain(grp);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Error - Add group that already exists', async () => {
    const acc = 'wallet';
    const grp = 'clothes';
    try {
      await attrOrm.addGroupToAccount(acc, grp);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* already has group/);
    }
  });
  test('Error - Copy to account that already exists', async () => {
    const frAcc = 'bank';
    const toAcc = 'pillow';
    const cpTrans = false;
    try {
      await attrOrm.copyAccount(frAcc, toAcc, cpTrans);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* already exists/i);
    }
  });
  test('Copy account attributes', async () => {
    const frAcc = 'bank'; // contains groups: electronics, clothes
    const toAcc = 'cash';
    const cpTrans = false;
    try {
      await attrOrm.copyAccount(frAcc, toAcc, cpTrans);
      const accRb = await attrOrm.getAccount(toAcc);
      const groups = await attrOrm.getGroups(toAcc);
      expect(accRb).toEqual(toAcc);
      expect(groups.length).toEqual(2);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Merge accounts', async () => {
    const frAcc = 'bank';
    const toAcc = 'pillow';
    try {
      await attrOrm.mergeAccounts(frAcc, toAcc);
      const groups = await attrOrm.getGroups(toAcc);
      expect(groups.length).toEqual(2);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test('Remove group from account', async () => {
    const acc = 'bank';
    const grp = 'electronics';
    try {
      await attrOrm.removeGroupFromAccount(acc, grp);
      const groups = await attrOrm.getGroups(acc);
      expect(groups.length).toEqual(1);
      expect(groups).not.toContain(grp);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test("Error - Remove group that doesn't exist", async () => {
    const acc = 'bank';
    const grp = 'electronics';
    try {
      await attrOrm.removeGroupFromAccount(acc, grp);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/not found/);
    }
  });
  test('Remove account', async () => {
    const acc = 'bank';
    try {
      await attrOrm.removeAccount(acc);
    } catch (err) {
      expect(err).toBeFalsy();
    }
    try {
      const accRb = await attrOrm.getAccount(acc);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* not found/);
    }
  });
  test('Remove group from account', async () => {
    const acc = 'wallet';
    const grp = 'clothes';
    try {
      await attrOrm.removeGroupFromAccount(acc, grp);
      const groups = await attrOrm.getGroups(acc);
      expect(groups.length).toEqual(0);
      expect(groups).not.toContain(grp);
    } catch (err) {
      expect(err).toBeFalsy();
    }
  });
  test("Error - remove account that doesn't exist", async () => {
    const acc = 'bank';
    try {
      await attrOrm.removeAccount(acc);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* not found/);
    }
  });
  test('Remove account', async () => {
    const acc = 'wallet';
    try {
      await attrOrm.removeAccount(acc);
    } catch (err) {
      expect(err).toBeFalsy();
    }
    try {
      const accRb = await attrOrm.getAccount(acc);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* not found/);
    }
  });
  test('Remove account', async () => {
    const acc = 'pillow';
    try {
      await attrOrm.removeAccount(acc);
    } catch (err) {
      expect(err).toBeFalsy();
    }
    try {
      const accRb = await attrOrm.getAccount(acc);
    } catch (err) {
      expect(err).toBeTruthy();
      expect(err.message).toMatch(/Account .* not found/);
    }
  });
});
