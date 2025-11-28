"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = withTransaction;
async function withTransaction(manager, trx, run, beginTransaction = true) {
    if (trx)
        return await run(trx);
    if (beginTransaction)
        return await manager.transaction(run);
    return await run(manager);
}
//# sourceMappingURL=transaction.js.map