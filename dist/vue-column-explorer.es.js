import { reactive as ee, ref as P, computed as M, markRaw as Z, defineComponent as W, createElementBlock as r, openBlock as i, Fragment as E, renderList as L, createElementVNode as g, createBlock as R, createCommentVNode as C, normalizeClass as V, toDisplayString as I, unref as D, resolveComponent as ie, withModifiers as K, resolveDynamicComponent as G, normalizeStyle as te, createVNode as Y, createStaticVNode as ae, createTextVNode as re, onMounted as ue, onUnmounted as de, Teleport as me } from "vue";
import * as X from "lucide-vue-next";
import { ChevronRight as he, Filter as fe, RefreshCw as ve, Mail as ge, Edit as ne, Download as le, Trash as oe, Eye as be } from "lucide-vue-next";
function ke(e) {
  const m = ee(/* @__PURE__ */ new Map()), o = P(-1), d = P([]), u = P({}), h = P({
    appearance: {
      columnWidth: 300,
      maxVisibleColumns: 4,
      animationDuration: 200,
      theme: "light"
    },
    behavior: {
      clickBehavior: "single",
      selectionPersistence: !1,
      autoLoadNextPage: !0,
      scrollBehavior: "smooth"
    },
    performance: {
      itemsPerPage: 50,
      virtualScrollThreshold: 100,
      maxConcurrentRequests: 2,
      requestTimeout: 1e4
    }
  }), k = M(() => {
    const s = [];
    for (let l = 0; l <= o.value; l++) {
      const n = m.get(l);
      n && s.push(n);
    }
    return s;
  }), p = M(() => {
    const s = m.get(o.value);
    return (s == null ? void 0 : s.selectedIds) || /* @__PURE__ */ new Set();
  }), x = M(() => {
    const s = m.get(o.value);
    return !!(s && s.selectedIds.size > 0);
  }), O = M(() => {
    const s = [];
    for (let t = 0; t <= o.value; t++) {
      const c = m.get(t);
      if (c) {
        const S = c.items.find(
          (a) => c.selectedIds.has(a.id)
        );
        s.push({
          columnId: c.config.id,
          selectedItem: S || null,
          selectedIds: new Set(c.selectedIds)
        });
      }
    }
    const l = o.value > 0 ? m.get(o.value - 1) : null, n = l ? l.items.find((t) => l.selectedIds.has(t.id)) : null;
    return {
      parentId: (n == null ? void 0 : n.id) || null,
      parentItem: n || null,
      breadcrumb: d.value,
      globalFilters: u.value,
      columnChain: s,
      external: e,
      // Include external context
      getParentData(t) {
        const c = o.value - t;
        return s[c];
      },
      getColumnData(t) {
        return s.find((c) => c.columnId === t);
      }
    };
  });
  function $(s) {
    h.value = {
      appearance: { ...h.value.appearance, ...s.appearance },
      behavior: { ...h.value.behavior, ...s.behavior },
      performance: { ...h.value.performance, ...s.performance }
    };
  }
  async function v(s, l) {
    const n = l ?? o.value + 1;
    for (let c = m.size - 1; c > n; c--)
      m.delete(c);
    const t = {
      config: Z(s),
      items: [],
      selectedIds: /* @__PURE__ */ new Set(),
      page: 0,
      hasMore: !0,
      isLoading: !1,
      error: null,
      filters: {}
    };
    m.set(n, t), o.value = n, n === 0 && (d.value = [{
      columnId: s.id,
      columnName: s.name
    }]), await _(n);
  }
  async function _(s, l = 0) {
    const n = m.get(s);
    if (n) {
      n.isLoading = !0, n.error = null, l === 0 && (n.items = []);
      try {
        const t = O.value, c = await n.config.dataProvider.fetch({
          parentId: t.parentId,
          page: l,
          filters: { ...u.value, ...n.filters },
          context: t
        });
        let S = c.items;
        if (n.currentSort && n.config.sortOptions) {
          const a = n.config.sortOptions.find((f) => f.key === n.currentSort);
          a && (S = [...S].sort(a.sortFn));
        }
        l === 0 ? n.items = S : n.items.push(...S), n.hasMore = c.hasMore, n.page = l;
      } catch (t) {
        n.error = t, console.error("Error loading column data:", t);
      } finally {
        n.isLoading = !1;
      }
    }
  }
  async function B(s) {
    const l = m.get(s);
    !l || !l.hasMore || l.isLoading || await _(s, l.page + 1);
  }
  async function N(s) {
    const l = m.get(s);
    l && (l.selectedIds.clear(), l.page = 0, await _(s, 0));
  }
  function q(s, l, n = !1) {
    var c;
    const t = m.get(s);
    !t || !((c = t.config.selection) != null && c.enabled) || (n && t.config.selection.multiple ? t.selectedIds.has(l) ? t.selectedIds.delete(l) : t.selectedIds.add(l) : (t.selectedIds.clear(), t.selectedIds.add(l)));
  }
  function y(s) {
    const l = m.get(s);
    l && l.selectedIds.clear();
  }
  async function z(s, l) {
    var S, a, f;
    const n = m.get(l);
    if (!n || !n.config.itemClick) return;
    const t = O.value, c = await ((a = (S = n.config.itemClick).handler) == null ? void 0 : a.call(S, s, t));
    if (c != null && c.column)
      d.value = d.value.slice(0, l + 1), await v(Z(c.column), l + 1), d.value.push({
        columnId: c.column.id,
        columnName: s.name,
        itemId: s.id,
        itemName: s.name
      });
    else if (c != null && c.action) {
      const b = (f = n.config.actions) == null ? void 0 : f.find((w) => w.key === c.action);
      b && await T(l, b.key);
    } else c != null && c.custom && c.custom();
  }
  async function T(s, l) {
    var S;
    const n = m.get(s);
    if (!n) return;
    const t = (S = n.config.actions) == null ? void 0 : S.find((a) => a.key === l);
    if (!t) return;
    const c = Array.from(n.selectedIds);
    if (c.length !== 0)
      try {
        const a = O.value;
        await t.handler(c, a), console.log("[executeAction] skipRefresh:", t.skipRefresh, "actionKey:", l), t.skipRefresh ? console.log("[executeAction] Skipping refresh for column", s) : (console.log("[executeAction] Refreshing column", s), await N(s));
      } catch (a) {
        console.error("Error executing action:", a);
      }
  }
  function U(s) {
    for (let l = m.size - 1; l > s; l--)
      m.delete(l);
    o.value = s, d.value = d.value.slice(0, s + 1);
  }
  function F(s, l, n) {
    const t = m.get(s);
    t && (n == null || n === "" ? delete t.filters[l] : t.filters[l] = n, _(s, 0));
  }
  function H(s, l) {
    const n = m.get(s);
    n && (l == null || l === "" ? n.currentSort = void 0 : n.currentSort = l, _(s, 0));
  }
  return {
    // State
    columns: m,
    activeColumnIndex: o,
    breadcrumb: d,
    globalFilters: u,
    config: h,
    // Getters
    visibleColumns: k,
    currentSelection: p,
    canNavigateForward: x,
    getContext: O,
    // Actions
    setConfig: $,
    openColumn: v,
    loadColumnData: _,
    loadNextPage: B,
    refreshColumn: N,
    selectItem: q,
    clearSelection: y,
    navigateToItem: z,
    executeAction: T,
    navigateToBreadcrumb: U,
    setFilter: F,
    setSort: H
  };
}
const Ce = { class: "explorer-breadcrumb" }, pe = ["onClick"], ye = /* @__PURE__ */ W({
  __name: "ExplorerBreadcrumb",
  props: {
    breadcrumb: {}
  },
  emits: ["navigate"],
  setup(e, { emit: m }) {
    const o = m, d = (u) => {
      o("navigate", u);
    };
    return (u, h) => (i(), r("div", Ce, [
      (i(!0), r(E, null, L(e.breadcrumb, (k, p) => (i(), r("div", {
        key: p,
        class: "breadcrumb-item"
      }, [
        g("button", {
          class: V(["breadcrumb-item__button", { "breadcrumb-item__button--active": p === e.breadcrumb.length - 1 }]),
          onClick: (x) => d(p)
        }, I(k.itemName || k.columnName), 11, pe),
        p < e.breadcrumb.length - 1 ? (i(), R(D(he), {
          key: 0,
          size: 16,
          class: "breadcrumb-separator"
        })) : C("", !0)
      ]))), 128))
    ]));
  }
}), j = (e, m) => {
  const o = e.__vccOpts || e;
  for (const [d, u] of m)
    o[d] = u;
  return o;
}, Se = /* @__PURE__ */ j(ye, [["__scopeId", "data-v-27ca8931"]]), xe = {
  key: 0,
  class: "explorer-item__checkbox"
}, _e = ["checked"], we = { class: "explorer-item__content" }, Ie = {
  key: 0,
  class: "explorer-item__icon"
}, Me = { class: "explorer-item__details" }, $e = { class: "explorer-item__name" }, Oe = {
  key: 0,
  class: "explorer-item__metadata"
}, Ae = {
  key: 1,
  class: "explorer-item__chevron"
}, Be = {
  key: 1,
  class: "item-status"
}, Ne = {
  key: 2,
  class: "item-count"
}, Ee = /* @__PURE__ */ W({
  __name: "ExplorerItem",
  props: {
    item: {},
    selected: { type: Boolean, default: !1 },
    selectable: { type: Boolean, default: !1 },
    clickable: { type: Boolean, default: !0 },
    showIcon: { type: Boolean, default: !0 },
    showMetadata: { type: Boolean, default: !0 }
  },
  emits: ["click", "dblclick", "contextmenu", "select"],
  setup(e, { emit: m }) {
    const o = e, d = m, u = M(() => {
      if (!o.item.icon)
        return o.item.type === "folder" ? X.Folder : X.File;
      if (o.item.icon.startsWith("lucide:")) {
        const _ = o.item.icon.replace("lucide:", "").split("-").map((N) => N.charAt(0).toUpperCase() + N.slice(1)).join(""), B = X[_];
        if (B)
          return B;
      }
      return X.File;
    }), h = M(() => {
      const v = o.item.badgeColor;
      return v && ["success", "error", "warning", "info"].includes(v.toLowerCase()) ? `item-badge--${v.toLowerCase()}` : "";
    }), k = M(() => {
      const v = o.item.badgeColor;
      return v ? ["success", "error", "warning", "info"].includes(v.toLowerCase()) ? {} : {
        backgroundColor: v,
        color: "#ffffff"
      } : {};
    }), p = (v) => {
      o.clickable && !o.item.disabled && d("click", o.item, v);
    }, x = (v) => {
      d("dblclick", o.item, v);
    }, O = (v) => {
      d("contextmenu", o.item, v);
    }, $ = (v) => {
      d("select", o.item, !0);
    };
    return (v, _) => {
      const B = ie("ChevronRight");
      return i(), r("div", {
        class: V(["explorer-item", {
          "explorer-item--selected": e.selected,
          "explorer-item--clickable": e.clickable && !e.item.disabled,
          "explorer-item--disabled": e.item.disabled
        }]),
        onClick: p,
        onDblclick: x,
        onContextmenu: K(O, ["prevent"])
      }, [
        e.selectable ? (i(), r("div", xe, [
          g("input", {
            type: "checkbox",
            checked: e.selected,
            onClick: K($, ["stop"])
          }, null, 8, _e)
        ])) : C("", !0),
        g("div", we, [
          e.showIcon ? (i(), r("div", Ie, [
            (i(), R(G(u.value), { size: 20 }))
          ])) : C("", !0),
          g("div", Me, [
            g("div", $e, I(e.item.name), 1),
            e.showMetadata && e.item.description ? (i(), r("div", Oe, I(e.item.description), 1)) : C("", !0)
          ])
        ]),
        e.item.badge !== void 0 || e.item.status !== void 0 || e.item.count !== void 0 || e.item.hasChildren ? (i(), r("div", Ae, [
          e.item.badge !== void 0 ? (i(), r("span", {
            key: 0,
            class: V(["item-badge", h.value]),
            style: te(k.value)
          }, I(e.item.badge), 7)) : e.item.status !== void 0 ? (i(), r("span", Be, I(e.item.status), 1)) : e.item.count !== void 0 ? (i(), r("span", Ne, I(e.item.count), 1)) : C("", !0),
          e.item.hasChildren ? (i(), R(B, {
            key: 3,
            size: 16
          })) : C("", !0)
        ])) : C("", !0)
      ], 34);
    };
  }
}), Le = /* @__PURE__ */ j(Ee, [["__scopeId", "data-v-ed186481"]]), Re = { class: "explorer-column__header" }, Fe = { class: "explorer-column__title" }, De = { class: "explorer-column__actions" }, ze = {
  key: 0,
  class: "explorer-column__filters"
}, Te = {
  key: 0,
  class: "filter-item"
}, Pe = ["value"], Ve = ["value"], qe = { class: "filter-item__label" }, Ue = ["placeholder", "value", "onInput"], He = ["placeholder", "value", "onInput"], We = ["value", "onChange"], je = ["value"], Xe = {
  key: 0,
  class: "explorer-column__loading"
}, Ye = {
  key: 1,
  class: "explorer-column__error"
}, Ge = {
  key: 0,
  class: "error-message"
}, Je = {
  key: 2,
  class: "explorer-column__empty"
}, Qe = {
  key: 3,
  class: "explorer-column__items"
}, Ze = {
  key: 0,
  class: "explorer-column__loading-more"
}, Ke = {
  key: 1,
  class: "explorer-column__footer"
}, et = { class: "explorer-column__selection-info" }, tt = { class: "explorer-column__quick-actions" }, nt = ["onClick"], lt = /* @__PURE__ */ W({
  __name: "ExplorerColumn",
  props: {
    columnState: {},
    index: {},
    isActive: { type: Boolean }
  },
  emits: ["item-click", "item-select", "context-menu", "refresh", "load-more", "action", "filter-change", "sort-change"],
  setup(e, { emit: m }) {
    const o = e, d = m, u = P(null), h = P(!1), k = M(() => o.columnState.config.filters && o.columnState.config.filters.length > 0), p = M(() => o.columnState.config.sortOptions && o.columnState.config.sortOptions.length > 0), x = M(() => o.columnState.selectedIds.size > 0), O = M(() => {
      var l;
      return ((l = o.columnState.config.view) == null ? void 0 : l.loadingRows) || 10;
    }), $ = M(() => {
      var l;
      return ((l = o.columnState.config.view) == null ? void 0 : l.emptyMessage) || "No items found";
    }), v = M(() => o.columnState.isLoading && o.columnState.items.length === 0), _ = M(() => {
      if (!o.columnState.config.actions) return [];
      const l = o.columnState.items.filter(
        (t) => o.columnState.selectedIds.has(t.id)
      ), n = l.length;
      return o.columnState.config.actions.filter((t) => n === 1 && t.showOnSingleSelect === !1 || n > 1 && t.showOnMultipleSelect === !1 || n === 1 && t.showOnMultipleSelect === !0 && t.showOnSingleSelect === !1 || n > 1 && t.showOnSingleSelect === !0 && t.showOnMultipleSelect === !1 ? !1 : t.visible ? t.visible(l) : !0);
    }), B = () => {
      h.value = !h.value;
    }, N = (l, n) => {
      d("item-click", l, o.index);
    }, q = (l, n) => {
      d("item-select", l, o.index, n);
    }, y = (l, n) => {
      d("context-menu", l, o.index, n);
    }, z = () => {
      d("refresh", o.index);
    }, T = () => {
      if (!u.value) return;
      const { scrollTop: l, scrollHeight: n, clientHeight: t } = u.value;
      l + t >= n - 100 && o.columnState.hasMore && !o.columnState.isLoading && d("load-more", o.index);
    }, U = (l) => {
      d("action", l, o.index);
    }, F = (l, n) => {
      d("filter-change", l, n, o.index);
    }, H = (l) => {
      d("sort-change", l, o.index);
    }, s = (l) => ({
      "lucide:trash": oe,
      "lucide:download": le,
      "lucide:edit": ne,
      "lucide:mail": ge
    })[l] || null;
    return (l, n) => (i(), r("div", {
      class: V(["explorer-column", { "explorer-column--active": e.isActive }])
    }, [
      g("div", Re, [
        g("h3", Fe, I(e.columnState.config.name), 1),
        g("div", De, [
          k.value || p.value ? (i(), r("button", {
            key: 0,
            class: V(["explorer-column__filter-btn", { active: h.value }]),
            onClick: B
          }, [
            Y(D(fe), { size: 16 })
          ], 2)) : C("", !0),
          g("button", {
            class: "explorer-column__refresh-btn",
            onClick: z
          }, [
            Y(D(ve), { size: 16 })
          ])
        ])
      ]),
      h.value && (k.value || p.value) ? (i(), r("div", ze, [
        p.value ? (i(), r("div", Te, [
          n[2] || (n[2] = g("label", { class: "filter-item__label" }, "Sıralama", -1)),
          g("select", {
            class: "filter-item__select",
            value: e.columnState.currentSort || "",
            onChange: n[0] || (n[0] = (t) => H(t.target.value))
          }, [
            n[1] || (n[1] = g("option", { value: "" }, "Varsayılan", -1)),
            (i(!0), r(E, null, L(e.columnState.config.sortOptions, (t) => (i(), r("option", {
              key: t.key,
              value: t.key
            }, I(t.label), 9, Ve))), 128))
          ], 40, Pe)
        ])) : C("", !0),
        (i(!0), r(E, null, L(e.columnState.config.filters, (t) => (i(), r("div", {
          key: t.key,
          class: "filter-item"
        }, [
          g("label", qe, I(t.label), 1),
          t.type === "search" ? (i(), r("input", {
            key: 0,
            type: "text",
            class: "filter-item__input",
            placeholder: `Search ${t.label.toLowerCase()}...`,
            value: e.columnState.filters[t.key] || "",
            onInput: (c) => F(t.key, c.target.value)
          }, null, 40, Ue)) : t.type === "number" ? (i(), r("input", {
            key: 1,
            type: "number",
            class: "filter-item__input",
            placeholder: t.label,
            value: e.columnState.filters[t.key] || "",
            onInput: (c) => F(t.key, c.target.value)
          }, null, 40, He)) : t.type === "select" ? (i(), r("select", {
            key: 2,
            class: "filter-item__select",
            value: e.columnState.filters[t.key] || "",
            onChange: (c) => F(t.key, c.target.value)
          }, [
            n[3] || (n[3] = g("option", { value: "" }, "All", -1)),
            (i(!0), r(E, null, L(t.options, (c) => (i(), r("option", {
              key: c.value,
              value: c.value
            }, I(c.label), 9, je))), 128))
          ], 40, We)) : C("", !0)
        ]))), 128))
      ])) : C("", !0),
      g("div", {
        ref_key: "scrollContainer",
        ref: u,
        class: "explorer-column__content",
        onScroll: T
      }, [
        v.value ? (i(), r("div", Xe, [
          (i(!0), r(E, null, L(O.value, (t) => (i(), r("div", {
            key: t,
            class: "skeleton-item"
          }, [...n[4] || (n[4] = [
            ae('<div class="skeleton-item__icon" data-v-4cc9db4b></div><div class="skeleton-item__content" data-v-4cc9db4b><div class="skeleton-item__name" data-v-4cc9db4b></div><div class="skeleton-item__metadata" data-v-4cc9db4b></div></div><div class="skeleton-item__chevron" data-v-4cc9db4b></div>', 3)
          ])]))), 128))
        ])) : e.columnState.error ? (i(), r("div", Ye, [
          n[5] || (n[5] = g("p", null, "Error loading data", -1)),
          e.columnState.error.message ? (i(), r("p", Ge, I(e.columnState.error.message), 1)) : C("", !0),
          g("button", { onClick: z }, "Retry")
        ])) : e.columnState.items.length === 0 && !e.columnState.isLoading ? (i(), r("div", Je, I($.value), 1)) : e.columnState.items.length > 0 ? (i(), r("div", Qe, [
          (i(!0), r(E, null, L(e.columnState.items, (t) => {
            var c, S, a;
            return i(), R(Le, {
              key: t.id,
              item: t,
              selected: e.columnState.selectedIds.has(t.id),
              selectable: ((c = e.columnState.config.selection) == null ? void 0 : c.multiple) ?? !1,
              clickable: !0,
              "show-icon": ((S = e.columnState.config.view) == null ? void 0 : S.showIcon) ?? !0,
              "show-metadata": ((a = e.columnState.config.view) == null ? void 0 : a.showMetadata) ?? !0,
              onClick: (f, b) => N(f),
              onSelect: (f, b) => q(f, b),
              onContextmenu: (f, b) => y(f, b)
            }, null, 8, ["item", "selected", "selectable", "show-icon", "show-metadata", "onClick", "onSelect", "onContextmenu"]);
          }), 128)),
          e.columnState.isLoading && e.columnState.items.length > 0 ? (i(), r("div", Ze, " Loading more... ")) : C("", !0)
        ])) : C("", !0)
      ], 544),
      x.value ? (i(), r("div", Ke, [
        g("div", et, I(e.columnState.selectedIds.size) + " selected ", 1),
        g("div", tt, [
          (i(!0), r(E, null, L(_.value, (t) => (i(), r("button", {
            key: t.key,
            class: V(["action-btn", `action-btn--${t.color || "default"}`]),
            onClick: (c) => U(t.key)
          }, [
            t.icon ? (i(), R(G(s(t.icon)), {
              key: 0,
              size: 14
            })) : C("", !0),
            re(" " + I(t.label), 1)
          ], 10, nt))), 128))
        ])
      ])) : C("", !0)
    ], 2));
  }
}), ot = /* @__PURE__ */ j(lt, [["__scopeId", "data-v-4cc9db4b"]]), st = ["onClick"], ct = /* @__PURE__ */ W({
  __name: "ExplorerContextMenu",
  props: {
    visible: { type: Boolean },
    x: {},
    y: {},
    actions: {}
  },
  emits: ["close", "action"],
  setup(e, { emit: m }) {
    const o = e, d = m, u = () => {
      d("close");
    }, h = (x) => {
      d("action", x.key), d("close");
    }, k = (x) => ({
      "lucide:download": le,
      "lucide:trash": oe,
      "lucide:edit": ne,
      "lucide:eye": be
    })[x] || null, p = () => {
      o.visible && d("close");
    };
    return ue(() => {
      document.addEventListener("click", p);
    }), de(() => {
      document.removeEventListener("click", p);
    }), (x, O) => (i(), R(me, { to: "body" }, [
      e.visible ? (i(), r("div", {
        key: 0,
        class: "context-menu",
        style: te({ top: `${e.y}px`, left: `${e.x}px` }),
        onClick: u
      }, [
        (i(!0), r(E, null, L(e.actions, ($) => (i(), r("div", {
          key: $.key,
          class: "context-menu__item",
          onClick: (v) => h($)
        }, [
          $.icon ? (i(), R(G(k($.icon)), {
            key: 0,
            size: 16
          })) : C("", !0),
          g("span", null, I($.label), 1)
        ], 8, st))), 128))
      ], 4)) : C("", !0)
    ]));
  }
}), it = /* @__PURE__ */ j(ct, [["__scopeId", "data-v-569d2f59"]]), at = { class: "explorer-container" }, rt = { class: "explorer-viewport" }, ut = /* @__PURE__ */ W({
  __name: "ExplorerContainer",
  props: {
    rootColumn: {},
    context: {}
  },
  setup(e, { expose: m }) {
    const o = e, d = ke(o.context), {
      breadcrumb: u,
      visibleColumns: h,
      activeColumnIndex: k,
      openColumn: p,
      selectItem: x,
      navigateToItem: O,
      navigateToBreadcrumb: $,
      refreshColumn: v,
      loadNextPage: _,
      executeAction: B,
      setFilter: N,
      setSort: q
    } = d, y = ee({
      visible: !1,
      x: 0,
      y: 0,
      actions: [],
      targetItem: null,
      targetColumnIndex: -1
    });
    o.rootColumn && p(o.rootColumn, 0);
    const z = async (a, f) => {
      x(f, a.id, !1);
      const b = d.columns.get(f);
      b != null && b.config.itemClick && await O(a, f);
    }, T = (a, f, b) => {
      x(f, a.id, b);
    }, U = (a, f, b) => {
      const w = d.columns.get(f);
      if (!(w != null && w.config.actions) || w.config.actions.length === 0) return;
      w.selectedIds.has(a.id) || x(f, a.id, !1);
      const J = w.selectedIds.size, Q = w.config.actions.filter((A) => {
        if (J === 1) {
          if (A.showOnSingleSelect !== void 0 && !A.showOnSingleSelect || A.showOnMultipleSelect === !0 && A.showOnSingleSelect !== void 0 && !A.showOnSingleSelect) return !1;
        } else if (J > 1 && (A.showOnMultipleSelect !== void 0 && !A.showOnMultipleSelect || A.showOnSingleSelect === !0 && A.showOnMultipleSelect !== void 0 && !A.showOnMultipleSelect))
          return !1;
        const se = w.items.filter((ce) => w.selectedIds.has(ce.id));
        return !(A.visible && !A.visible(se));
      });
      Q.length !== 0 && (y.visible = !0, y.x = b.clientX, y.y = b.clientY, y.actions = Q, y.targetItem = a, y.targetColumnIndex = f);
    }, F = () => {
      y.visible = !1;
    }, H = async (a) => {
      y.targetColumnIndex >= 0 && await B(y.targetColumnIndex, a);
    }, s = (a) => {
      $(a);
    }, l = async (a) => {
      await v(a);
    }, n = async (a) => {
      await _(a);
    }, t = async (a, f) => {
      await B(f, a);
    }, c = (a, f, b) => {
      N(b, a, f);
    }, S = (a, f) => {
      q(f, a);
    };
    return m({
      store: d,
      openColumn: (a) => p(a),
      refresh: () => v(k.value)
    }), (a, f) => (i(), r("div", at, [
      D(u).length > 0 ? (i(), R(Se, {
        key: 0,
        breadcrumb: D(u),
        onNavigate: s
      }, null, 8, ["breadcrumb"])) : C("", !0),
      g("div", rt, [
        (i(!0), r(E, null, L(D(h), (b, w) => (i(), R(ot, {
          key: w,
          "column-state": b,
          index: w,
          "is-active": w === D(k),
          onItemClick: z,
          onItemSelect: T,
          onContextMenu: U,
          onRefresh: l,
          onLoadMore: n,
          onAction: t,
          onFilterChange: c,
          onSortChange: S
        }, null, 8, ["column-state", "index", "is-active"]))), 128))
      ]),
      Y(it, {
        visible: y.visible,
        x: y.x,
        y: y.y,
        actions: y.actions,
        onClose: F,
        onAction: H
      }, null, 8, ["visible", "x", "y", "actions"])
    ]));
  }
}), dt = /* @__PURE__ */ j(ut, [["__scopeId", "data-v-e73b7d3f"]]);
function ft(e) {
  var m, o, d;
  return {
    id: e.id,
    name: e.name,
    dataProvider: {
      fetch: async (u) => {
        if (console.log(`[ColumnBuilder-${e.id}] fetch called with params:`, u), console.log(`[ColumnBuilder-${e.id}] config.data:`, e.data), console.log(`[ColumnBuilder-${e.id}] config.fetchData:`, typeof e.fetchData), e.data)
          return console.log(`[ColumnBuilder-${e.id}] Using static data`), {
            items: Array.isArray(e.data) ? e.data : [],
            hasMore: !1
          };
        if (e.fetchData) {
          console.log(`[ColumnBuilder-${e.id}] Calling fetchData...`);
          try {
            const h = await e.fetchData(u);
            return console.log(`[ColumnBuilder-${e.id}] fetchData returned:`, h), {
              items: Array.isArray(h) ? h : [],
              hasMore: !1
            };
          } catch (h) {
            throw console.error(`[ColumnBuilder-${e.id}] Error in fetchData:`, h), h;
          }
        }
        return console.warn(`[ColumnBuilder-${e.id}] No data source provided!`), {
          items: [],
          hasMore: !1
        };
      }
    },
    selection: {
      enabled: e.allowMultipleSelection !== void 0 || !!(e.singleActions && e.singleActions.length > 0) || !!(e.multipleActions && e.multipleActions.length > 0),
      multiple: e.allowMultipleSelection !== void 0 ? e.allowMultipleSelection : !1
    },
    filters: (m = e.filters) == null ? void 0 : m.map((u) => ({
      ...u,
      default: void 0
    })),
    sortOptions: e.sortOptions,
    actions: [
      ...((o = e.singleActions) == null ? void 0 : o.map((u) => ({
        key: u.key,
        label: u.label,
        icon: u.icon,
        color: u.color,
        skipRefresh: u.skipRefresh,
        showOnSingleSelect: !0,
        showOnMultipleSelect: !1,
        handler: async (h, k) => {
          await u.handler(h);
        }
      }))) || [],
      ...((d = e.multipleActions) == null ? void 0 : d.map((u) => ({
        key: u.key,
        label: u.label,
        icon: u.icon,
        color: u.color,
        skipRefresh: u.skipRefresh,
        showOnSingleSelect: !1,
        showOnMultipleSelect: !0,
        handler: async (h, k) => {
          await u.handler(h);
        }
      }))) || []
    ],
    itemClick: e.onItemClick ? {
      type: "navigate",
      handler: async (u, h) => {
        const k = await e.onItemClick(u, h);
        return k ? { column: k } : {};
      }
    } : void 0,
    view: {
      showIcon: !0,
      showMetadata: !0,
      emptyMessage: `No ${e.name.toLowerCase()} found`
    }
  };
}
const vt = {
  install(e) {
    e.component("ExplorerContainer", dt);
  }
};
export {
  dt as ExplorerContainer,
  ft as createColumn,
  vt as default,
  ke as useExplorer
};
