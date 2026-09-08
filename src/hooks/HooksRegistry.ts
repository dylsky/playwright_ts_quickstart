import {
    CollectArtifactsAction,
    HookParameters,
    ITestHookAction,
} from "./HookActionsCollection";
import { HookAction } from "./HookAction";
type SingleActionConstructor = new (hookParameters?: HookParameters) => ITestHookAction;

export class HookRegistry {
    private static readonly registry = new Map<HookAction, SingleActionConstructor>();

    static register(action: HookAction, actionConstructor: SingleActionConstructor) {
        this.registry.set(action, actionConstructor);
    }

    static resolve(action: HookAction): SingleActionConstructor {
        return this.registry.get(action)!;
    }
}

HookRegistry.register(HookAction.COLLECT_ARTIFACTS, CollectArtifactsAction);
