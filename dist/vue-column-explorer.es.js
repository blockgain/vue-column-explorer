import { reactive as ce, ref as q, computed as B, markRaw as ne, defineComponent as J, createElementBlock as u, openBlock as i, Fragment as E, renderList as L, createElementVNode as C, createBlock as N, createCommentVNode as w, normalizeClass as U, toDisplayString as I, unref as W, resolveComponent as ue, withModifiers as oe, resolveDynamicComponent as Y, normalizeStyle as ae, createVNode as K, createStaticVNode as de, createTextVNode as me, onMounted as he, onUnmounted as fe, Teleport as ve, watch as ge, nextTick as ke } from "vue";
import * as Z from "lucide-vue-next";
import { ChevronRight as be, Filter as Ce, RefreshCw as ye, Mail as se, Edit as ee, Download as te, Trash as le, FileSpreadsheet as Se, FileCheck as pe, FileBadge as we, Globe as _e, Clipboard as xe, Book as Ie, FileText as Me, User as $e, Folder as Be, File as ie, Eye as Oe } from "lucide-vue-next";
function Ae(e) {
  const f = ce(/* @__PURE__ */ new Map()), t = q(-1), h = q([]), d = q({}), k = q({
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
  }), p = B(() => {
    const n = [];
    for (let c = 0; c <= t.value; c++) {
      const s = f.get(c);
      s && n.push(s);
    }
    return n;
  }), y = B(() => {
    const n = f.get(t.value);
    return (n == null ? void 0 : n.selectedIds) || /* @__PURE__ */ new Set();
  }), x = B(() => {
    const n = f.get(t.value);
    return !!(n && n.selectedIds.size > 0);
  }), A = B(() => {
    const n = [];
    for (let o = 0; o <= t.value; o++) {
      const m = f.get(o);
      if (m) {
        const r = m.items.find(
          (b) => m.selectedIds.has(b.id)
        );
        n.push({
          columnId: m.config.id,
          selectedItem: r || null,
          selectedIds: new Set(m.selectedIds)
        });
      }
    }
    const c = t.value > 0 ? f.get(t.value - 1) : null, s = c ? c.items.find((o) => c.selectedIds.has(o.id)) : null, v = f.get(t.value), l = v ? v.items.filter((o) => v.selectedIds.has(o.id)) : [];
    return {
      parentId: (s == null ? void 0 : s.id) || null,
      parentItem: s || null,
      breadcrumb: h.value,
      globalFilters: d.value,
      columnChain: n,
      selectedItems: l,
      // Include selected items from active column
      external: e,
      // Include external context
      getParentData(o) {
        const m = t.value - o;
        return n[m];
      },
      getColumnData(o) {
        return n.find((m) => m.columnId === o);
      }
    };
  });
  function O(n) {
    k.value = {
      appearance: { ...k.value.appearance, ...n.appearance },
      behavior: { ...k.value.behavior, ...n.behavior },
      performance: { ...k.value.performance, ...n.performance }
    };
  }
  async function S(n, c) {
    const s = c ?? t.value + 1;
    for (let l = f.size - 1; l > s; l--)
      f.delete(l);
    const v = {
      config: ne(n),
      items: [],
      selectedIds: /* @__PURE__ */ new Set(),
      page: 0,
      hasMore: !0,
      isLoading: !1,
      error: null,
      filters: {}
    };
    f.set(s, v), t.value = s, s === 0 && (h.value = [{
      columnId: n.id,
      columnName: n.name
    }]), await M(s);
  }
  async function M(n, c = 0) {
    const s = f.get(n);
    if (s) {
      s.isLoading = !0, s.error = null, c === 0 && (s.items = []);
      try {
        const v = A.value, l = await s.config.dataProvider.fetch({
          parentId: v.parentId,
          page: c,
          filters: {
            ...d.value,
            ...s.filters,
            ...s.currentSort ? { sort: s.currentSort } : {}
          },
          context: v
        });
        let o = l.items;
        if (s.currentSort && s.config.sortOptions) {
          const m = s.config.sortOptions.find((r) => r.key === s.currentSort);
          m && m.sortFn && (o = [...o].sort(m.sortFn));
        }
        c === 0 ? s.items = o : s.items.push(...o), s.hasMore = l.hasMore, s.page = c;
      } catch (v) {
        s.error = v, console.error("Error loading column data:", v);
      } finally {
        s.isLoading = !1;
      }
    }
  }
  async function F(n) {
    const c = f.get(n);
    !c || !c.hasMore || c.isLoading || await M(n, c.page + 1);
  }
  async function R(n) {
    const c = f.get(n);
    c && (c.selectedIds = /* @__PURE__ */ new Set(), c.page = 0, await M(n, 0));
  }
  function H(n, c, s = !1) {
    var l;
    const v = f.get(n);
    if (!(!v || !((l = v.config.selection) != null && l.enabled)))
      if (s && v.config.selection.multiple) {
        const o = new Set(v.selectedIds);
        o.has(c) ? o.delete(c) : o.add(c), v.selectedIds = o;
      } else
        v.selectedIds = /* @__PURE__ */ new Set([c]);
  }
  function D(n) {
    const c = f.get(n);
    c && (c.selectedIds = /* @__PURE__ */ new Set());
  }
  async function $(n, c) {
    var o, m, r;
    const s = f.get(c);
    if (!s || !s.config.itemClick) return;
    const v = A.value, l = await ((m = (o = s.config.itemClick).handler) == null ? void 0 : m.call(o, n, v));
    if (l != null && l.column)
      h.value = h.value.slice(0, c + 1), await S(ne(l.column), c + 1), h.value.push({
        columnId: l.column.id,
        columnName: n.name,
        itemId: n.id,
        itemName: n.name
      });
    else if (l != null && l.action) {
      const b = (r = s.config.actions) == null ? void 0 : r.find((a) => a.key === l.action);
      b && await T(c, b.key);
    } else l != null && l.custom && l.custom();
  }
  async function T(n, c) {
    var o;
    const s = f.get(n);
    if (!s) return;
    const v = (o = s.config.actions) == null ? void 0 : o.find((m) => m.key === c);
    if (!v) return;
    const l = Array.from(s.selectedIds);
    if (l.length !== 0)
      try {
        const m = A.value;
        await v.handler(l, m), console.log("[executeAction] skipRefresh:", v.skipRefresh, "actionKey:", c), v.skipRefresh ? console.log("[executeAction] Skipping refresh for column", n) : (console.log("[executeAction] Refreshing column", n), await R(n));
      } catch (m) {
        console.error("Error executing action:", m);
      }
  }
  function G(n) {
    for (let c = f.size - 1; c > n; c--)
      f.delete(c);
    t.value = n, h.value = h.value.slice(0, n + 1);
  }
  function X(n, c, s) {
    const v = f.get(n);
    v && (s == null || s === "" ? delete v.filters[c] : v.filters[c] = s, M(n, 0));
  }
  function P(n, c) {
    const s = f.get(n);
    s && (c == null || c === "" ? s.currentSort = void 0 : s.currentSort = c, M(n, 0));
  }
  return {
    // State
    columns: f,
    activeColumnIndex: t,
    breadcrumb: h,
    globalFilters: d,
    config: k,
    // Getters
    visibleColumns: p,
    currentSelection: y,
    canNavigateForward: x,
    getContext: A,
    // Actions
    setConfig: O,
    openColumn: S,
    loadColumnData: M,
    loadNextPage: F,
    refreshColumn: R,
    selectItem: H,
    clearSelection: D,
    navigateToItem: $,
    executeAction: T,
    navigateToBreadcrumb: G,
    setFilter: X,
    setSort: P
  };
}
const Fe = { class: "explorer-breadcrumb" }, Ne = ["onClick"], Ee = /* @__PURE__ */ J({
  __name: "ExplorerBreadcrumb",
  props: {
    breadcrumb: {}
  },
  emits: ["navigate"],
  setup(e, { emit: f }) {
    const t = f, h = (d) => {
      t("navigate", d);
    };
    return (d, k) => (i(), u("div", Fe, [
      (i(!0), u(E, null, L(e.breadcrumb, (p, y) => (i(), u("div", {
        key: y,
        class: "breadcrumb-item"
      }, [
        C("button", {
          class: U(["breadcrumb-item__button", { "breadcrumb-item__button--active": y === e.breadcrumb.length - 1 }]),
          onClick: (x) => h(y)
        }, I(p.itemName || p.columnName), 11, Ne),
        y < e.breadcrumb.length - 1 ? (i(), N(W(be), {
          key: 0,
          size: 16,
          class: "breadcrumb-separator"
        })) : w("", !0)
      ]))), 128))
    ]));
  }
}), Q = (e, f) => {
  const t = e.__vccOpts || e;
  for (const [h, d] of f)
    t[h] = d;
  return t;
}, Le = /* @__PURE__ */ Q(Ee, [["__scopeId", "data-v-27ca8931"]]), Re = {
  key: 0,
  class: "explorer-item__checkbox"
}, De = ["checked"], ze = { class: "explorer-item__content" }, Te = {
  key: 0,
  class: "explorer-item__icon"
}, Pe = { class: "explorer-item__details" }, Ve = { class: "explorer-item__name" }, qe = {
  key: 0,
  class: "explorer-item__metadata"
}, Ue = {
  key: 1,
  class: "explorer-item__chevron"
}, We = {
  key: 1,
  class: "item-status"
}, je = {
  key: 2,
  class: "item-count"
}, He = /* @__PURE__ */ J({
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
  setup(e, { emit: f }) {
    const t = e, h = f, d = B(() => {
      if (!t.item.icon)
        return t.item.type === "folder" ? Z.Folder : Z.File;
      if (t.item.icon.startsWith("lucide:")) {
        const M = t.item.icon.replace("lucide:", "").split("-").map((R) => R.charAt(0).toUpperCase() + R.slice(1)).join(""), F = Z[M];
        if (F)
          return F;
      }
      return Z.File;
    }), k = B(() => {
      const S = t.item.badgeColor;
      return S && ["success", "error", "warning", "info"].includes(S.toLowerCase()) ? `item-badge--${S.toLowerCase()}` : "";
    }), p = B(() => {
      const S = t.item.badgeColor;
      return S ? ["success", "error", "warning", "info"].includes(S.toLowerCase()) ? {} : {
        backgroundColor: S,
        color: "#ffffff"
      } : {};
    }), y = (S) => {
      t.clickable && !t.item.disabled && h("click", t.item, S);
    }, x = (S) => {
      h("dblclick", t.item, S);
    }, A = (S) => {
      h("contextmenu", t.item, S);
    }, O = (S) => {
      h("select", t.item, !0);
    };
    return (S, M) => {
      const F = ue("ChevronRight");
      return i(), u("div", {
        class: U(["explorer-item", {
          "explorer-item--selected": e.selected,
          "explorer-item--clickable": e.clickable && !e.item.disabled,
          "explorer-item--disabled": e.item.disabled
        }]),
        onClick: y,
        onDblclick: x,
        onContextmenu: oe(A, ["prevent"])
      }, [
        e.selectable ? (i(), u("div", Re, [
          C("input", {
            type: "checkbox",
            checked: e.selected,
            onClick: oe(O, ["stop"])
          }, null, 8, De)
        ])) : w("", !0),
        C("div", ze, [
          e.showIcon ? (i(), u("div", Te, [
            (i(), N(Y(d.value), { size: 20 }))
          ])) : w("", !0),
          C("div", Pe, [
            C("div", Ve, I(e.item.name), 1),
            e.showMetadata && e.item.description ? (i(), u("div", qe, I(e.item.description), 1)) : w("", !0)
          ])
        ]),
        e.item.badge !== void 0 || e.item.status !== void 0 || e.item.count !== void 0 || e.item.hasChildren ? (i(), u("div", Ue, [
          e.item.badge !== void 0 ? (i(), u("span", {
            key: 0,
            class: U(["item-badge", k.value]),
            style: ae(p.value)
          }, I(e.item.badge), 7)) : e.item.status !== void 0 ? (i(), u("span", We, I(e.item.status), 1)) : e.item.count !== void 0 ? (i(), u("span", je, I(e.item.count), 1)) : w("", !0),
          e.item.hasChildren ? (i(), N(F, {
            key: 3,
            size: 16
          })) : w("", !0)
        ])) : w("", !0)
      ], 34);
    };
  }
}), Ge = /* @__PURE__ */ Q(He, [["__scopeId", "data-v-ed186481"]]), Xe = {
  key: 0,
  class: "explorer-column explorer-column--detail"
}, Ye = { class: "detail-view" }, Je = { class: "detail-view__header" }, Qe = { class: "detail-view__icon" }, Ze = { class: "detail-view__content" }, Ke = { class: "detail-view__title" }, et = {
  key: 0,
  class: "detail-view__description"
}, tt = {
  key: 0,
  class: "detail-view__actions"
}, lt = ["onClick"], nt = { class: "explorer-column__header" }, ot = { class: "explorer-column__title" }, st = { class: "explorer-column__actions" }, it = {
  key: 0,
  class: "explorer-column__filters"
}, ct = {
  key: 0,
  class: "filter-item"
}, at = ["value"], rt = ["value"], ut = { class: "filter-item__label" }, dt = ["placeholder", "value", "onInput"], mt = ["placeholder", "value", "onInput"], ht = ["value", "onChange"], ft = ["value"], vt = {
  key: 0,
  class: "explorer-column__loading"
}, gt = {
  key: 1,
  class: "explorer-column__error"
}, kt = {
  key: 0,
  class: "error-message"
}, bt = {
  key: 2,
  class: "explorer-column__empty"
}, Ct = {
  key: 3,
  class: "explorer-column__items"
}, yt = {
  key: 0,
  class: "explorer-column__loading-more"
}, St = {
  key: 1,
  class: "explorer-column__footer"
}, pt = { class: "explorer-column__selection-info" }, wt = { class: "explorer-column__quick-actions" }, _t = ["onClick"], xt = /* @__PURE__ */ J({
  __name: "ExplorerColumn",
  props: {
    columnState: {},
    index: {},
    isActive: { type: Boolean }
  },
  emits: ["item-click", "item-select", "context-menu", "refresh", "load-more", "action", "filter-change", "sort-change"],
  setup(e, { emit: f }) {
    const t = e, h = f, d = q(null), k = q(!1), p = B(() => t.columnState.config.filters && t.columnState.config.filters.length > 0), y = B(() => t.columnState.config.sortOptions && t.columnState.config.sortOptions.length > 0), x = B(() => t.columnState.selectedIds.size > 0), A = B(() => {
      var l;
      return ((l = t.columnState.config.view) == null ? void 0 : l.loadingRows) || 10;
    }), O = B(() => {
      var l;
      return ((l = t.columnState.config.view) == null ? void 0 : l.emptyMessage) || "No items found";
    }), S = B(() => t.columnState.isLoading && t.columnState.items.length === 0), M = B(() => {
      if (!t.columnState.config.actions) return [];
      const l = t.columnState.items.filter(
        (m) => t.columnState.selectedIds.has(m.id)
      ), o = l.length;
      return t.columnState.config.actions.filter((m) => o === 1 && m.showOnSingleSelect === !1 || o > 1 && m.showOnMultipleSelect === !1 || o === 1 && m.showOnMultipleSelect === !0 && m.showOnSingleSelect === !1 || o > 1 && m.showOnSingleSelect === !0 && m.showOnMultipleSelect === !1 ? !1 : m.visible ? m.visible(l) : !0);
    }), F = B(() => {
      const l = Object.keys(t.columnState.filters).some((m) => {
        const r = t.columnState.filters[m];
        return r != null && r !== "";
      }), o = t.columnState.currentSort !== null && t.columnState.currentSort !== void 0 && t.columnState.currentSort !== "";
      return l || o;
    }), R = () => {
      k.value = !k.value;
    }, H = (l, o) => {
      h("item-click", l, t.index);
    }, D = (l, o) => {
      h("item-select", l, t.index, o);
    }, $ = (l, o) => {
      h("context-menu", l, t.index, o);
    }, T = () => {
      h("refresh", t.index);
    }, G = () => {
      if (!d.value) return;
      const { scrollTop: l, scrollHeight: o, clientHeight: m } = d.value;
      l + m >= o - 100 && t.columnState.hasMore && !t.columnState.isLoading && h("load-more", t.index);
    }, X = (l) => {
      h("action", l, t.index);
    }, P = (l, o) => {
      h("filter-change", l, o, t.index);
    }, n = (l) => {
      h("sort-change", l, t.index);
    }, c = (l) => ({
      "lucide:trash": le,
      "lucide:download": te,
      "lucide:edit": ee,
      "lucide:mail": se
    })[l] || null, s = (l) => ({
      "lucide:file": ie,
      "lucide:folder": Be,
      "lucide:user": $e,
      "lucide:file-text": Me,
      "lucide:book": Ie,
      "lucide:clipboard": xe,
      "lucide:globe": _e,
      "lucide:file-badge": we,
      "lucide:file-check": pe,
      "lucide:file-spreadsheet": Se,
      "lucide:download": te,
      "lucide:trash": le,
      "lucide:edit": ee,
      "lucide:mail": se
    })[l] || ie, v = (l) => {
      h("action", l, t.index);
    };
    return (l, o) => {
      var m, r, b;
      return e.columnState.config.isDetailView ? (i(), u("div", Xe, [
        C("div", Ye, [
          C("div", Je, [
            C("div", Qe, [
              (m = e.columnState.config.detailItem) != null && m.icon ? (i(), N(Y(s(e.columnState.config.detailItem.icon)), {
                key: 0,
                size: 48,
                "stroke-width": 1.5
              })) : w("", !0)
            ])
          ]),
          C("div", Ze, [
            C("h3", Ke, I((r = e.columnState.config.detailItem) == null ? void 0 : r.name), 1),
            (b = e.columnState.config.detailItem) != null && b.description ? (i(), u("p", et, I(e.columnState.config.detailItem.description), 1)) : w("", !0)
          ]),
          M.value.length > 0 ? (i(), u("div", tt, [
            (i(!0), u(E, null, L(M.value, (a) => (i(), u("button", {
              key: a.key,
              class: U(["detail-view__action-btn", [`detail-view__action-btn--${a.color || "default"}`]]),
              onClick: (g) => v(a.key)
            }, [
              a.icon ? (i(), N(Y(s(a.icon)), {
                key: 0,
                size: 18,
                "stroke-width": 2
              })) : w("", !0),
              C("span", null, I(a.label), 1)
            ], 10, lt))), 128))
          ])) : w("", !0)
        ])
      ])) : (i(), u("div", {
        key: 1,
        class: U(["explorer-column", { "explorer-column--active": e.isActive }])
      }, [
        C("div", nt, [
          C("h3", ot, I(e.columnState.config.name), 1),
          C("div", st, [
            p.value || y.value ? (i(), u("button", {
              key: 0,
              class: U(["explorer-column__filter-btn", {
                active: k.value,
                "has-active-filters": F.value
              }]),
              onClick: R
            }, [
              K(W(Ce), { size: 16 })
            ], 2)) : w("", !0),
            C("button", {
              class: "explorer-column__refresh-btn",
              onClick: T
            }, [
              K(W(ye), { size: 16 })
            ])
          ])
        ]),
        k.value && (p.value || y.value) ? (i(), u("div", it, [
          y.value ? (i(), u("div", ct, [
            o[2] || (o[2] = C("label", { class: "filter-item__label" }, "Sıralama", -1)),
            C("select", {
              class: "filter-item__select",
              value: e.columnState.currentSort || "",
              onChange: o[0] || (o[0] = (a) => n(a.target.value))
            }, [
              o[1] || (o[1] = C("option", { value: "" }, "Varsayılan", -1)),
              (i(!0), u(E, null, L(e.columnState.config.sortOptions, (a) => (i(), u("option", {
                key: a.key,
                value: a.key
              }, I(a.label), 9, rt))), 128))
            ], 40, at)
          ])) : w("", !0),
          (i(!0), u(E, null, L(e.columnState.config.filters, (a) => (i(), u("div", {
            key: a.key,
            class: "filter-item"
          }, [
            C("label", ut, I(a.label), 1),
            a.type === "search" ? (i(), u("input", {
              key: 0,
              type: "text",
              class: "filter-item__input",
              placeholder: `Search ${a.label.toLowerCase()}...`,
              value: e.columnState.filters[a.key] || "",
              onInput: (g) => P(a.key, g.target.value)
            }, null, 40, dt)) : a.type === "number" ? (i(), u("input", {
              key: 1,
              type: "number",
              class: "filter-item__input",
              placeholder: a.label,
              value: e.columnState.filters[a.key] || "",
              onInput: (g) => P(a.key, g.target.value)
            }, null, 40, mt)) : a.type === "select" ? (i(), u("select", {
              key: 2,
              class: "filter-item__select",
              value: e.columnState.filters[a.key] || "",
              onChange: (g) => P(a.key, g.target.value)
            }, [
              (i(!0), u(E, null, L(a.options, (g) => (i(), u("option", {
                key: g.value,
                value: g.value
              }, I(g.label), 9, ft))), 128))
            ], 40, ht)) : w("", !0)
          ]))), 128))
        ])) : w("", !0),
        C("div", {
          ref_key: "scrollContainer",
          ref: d,
          class: "explorer-column__content",
          onScroll: G
        }, [
          S.value ? (i(), u("div", vt, [
            (i(!0), u(E, null, L(A.value, (a) => (i(), u("div", {
              key: a,
              class: "skeleton-item"
            }, [...o[3] || (o[3] = [
              de('<div class="skeleton-item__icon" data-v-9b3a2381></div><div class="skeleton-item__content" data-v-9b3a2381><div class="skeleton-item__name" data-v-9b3a2381></div><div class="skeleton-item__metadata" data-v-9b3a2381></div></div><div class="skeleton-item__chevron" data-v-9b3a2381></div>', 3)
            ])]))), 128))
          ])) : e.columnState.error ? (i(), u("div", gt, [
            o[4] || (o[4] = C("p", null, "Error loading data", -1)),
            e.columnState.error.message ? (i(), u("p", kt, I(e.columnState.error.message), 1)) : w("", !0),
            C("button", { onClick: T }, "Retry")
          ])) : e.columnState.items.length === 0 && !e.columnState.isLoading ? (i(), u("div", bt, I(O.value), 1)) : e.columnState.items.length > 0 ? (i(), u("div", Ct, [
            (i(!0), u(E, null, L(e.columnState.items, (a) => {
              var g, z, V;
              return i(), N(Ge, {
                key: a.id,
                item: a,
                selected: e.columnState.selectedIds.has(a.id),
                selectable: ((g = e.columnState.config.selection) == null ? void 0 : g.multiple) ?? !1,
                clickable: !0,
                "show-icon": ((z = e.columnState.config.view) == null ? void 0 : z.showIcon) ?? !0,
                "show-metadata": ((V = e.columnState.config.view) == null ? void 0 : V.showMetadata) ?? !0,
                onClick: (_, j) => H(_),
                onSelect: (_, j) => D(_, j),
                onContextmenu: (_, j) => $(_, j)
              }, null, 8, ["item", "selected", "selectable", "show-icon", "show-metadata", "onClick", "onSelect", "onContextmenu"]);
            }), 128)),
            e.columnState.isLoading && e.columnState.items.length > 0 ? (i(), u("div", yt, " Loading more... ")) : w("", !0)
          ])) : w("", !0)
        ], 544),
        x.value && !e.columnState.config.isDetailView ? (i(), u("div", St, [
          C("div", pt, I(e.columnState.selectedIds.size) + " selected ", 1),
          C("div", wt, [
            (i(!0), u(E, null, L(M.value, (a) => (i(), u("button", {
              key: a.key,
              class: U(["action-btn", `action-btn--${a.color || "default"}`]),
              onClick: (g) => X(a.key)
            }, [
              a.icon ? (i(), N(Y(c(a.icon)), {
                key: 0,
                size: 14
              })) : w("", !0),
              me(" " + I(a.label), 1)
            ], 10, _t))), 128))
          ])
        ])) : w("", !0)
      ], 2));
    };
  }
}), It = /* @__PURE__ */ Q(xt, [["__scopeId", "data-v-9b3a2381"]]), Mt = ["onClick"], $t = /* @__PURE__ */ J({
  __name: "ExplorerContextMenu",
  props: {
    visible: { type: Boolean },
    x: {},
    y: {},
    actions: {}
  },
  emits: ["close", "action"],
  setup(e, { emit: f }) {
    const t = e, h = f, d = () => {
      h("close");
    }, k = (x) => {
      h("action", x.key), h("close");
    }, p = (x) => ({
      "lucide:download": te,
      "lucide:trash": le,
      "lucide:edit": ee,
      "lucide:eye": Oe
    })[x] || null, y = () => {
      t.visible && h("close");
    };
    return he(() => {
      document.addEventListener("click", y);
    }), fe(() => {
      document.removeEventListener("click", y);
    }), (x, A) => (i(), N(ve, { to: "body" }, [
      e.visible ? (i(), u("div", {
        key: 0,
        class: "context-menu",
        style: ae({ top: `${e.y}px`, left: `${e.x}px` }),
        onClick: d
      }, [
        (i(!0), u(E, null, L(e.actions, (O) => (i(), u("div", {
          key: O.key,
          class: "context-menu__item",
          onClick: (S) => k(O)
        }, [
          O.icon ? (i(), N(Y(p(O.icon)), {
            key: 0,
            size: 16
          })) : w("", !0),
          C("span", null, I(O.label), 1)
        ], 8, Mt))), 128))
      ], 4)) : w("", !0)
    ]));
  }
}), Bt = /* @__PURE__ */ Q($t, [["__scopeId", "data-v-569d2f59"]]), Ot = { class: "explorer-container" }, At = { class: "explorer-main" }, Ft = /* @__PURE__ */ J({
  __name: "ExplorerContainer",
  props: {
    rootColumn: {},
    context: {}
  },
  setup(e, { expose: f }) {
    const t = e, h = Ae(t.context), {
      breadcrumb: d,
      visibleColumns: k,
      activeColumnIndex: p,
      openColumn: y,
      selectItem: x,
      navigateToItem: A,
      navigateToBreadcrumb: O,
      refreshColumn: S,
      loadNextPage: M,
      executeAction: F,
      setFilter: R,
      setSort: H
    } = h, D = q(null), $ = ce({
      visible: !1,
      x: 0,
      y: 0,
      actions: [],
      targetItem: null,
      targetColumnIndex: -1
    });
    ge(p, async () => {
      await ke(), requestAnimationFrame(() => {
        D.value && D.value.scrollTo({
          left: D.value.scrollWidth,
          behavior: "smooth"
        });
      });
    }, { flush: "post" }), t.rootColumn && y(t.rootColumn, 0);
    const T = async (r, b) => {
      var g;
      if (x(b, r.id, !1), r.show) {
        const z = h.columns.get(b);
        if (!z) return;
        const V = {
          id: `detail-${r.id}`,
          name: r.name,
          isDetailView: !0,
          detailItem: r,
          dataProvider: {
            fetch: async () => ({ items: [r], hasMore: !1 })
          },
          selection: {
            enabled: !0,
            multiple: !1
          },
          actions: ((g = z.config.actions) == null ? void 0 : g.filter((_) => _.showOnSingleSelect === !0)) || []
        };
        await y(V, b + 1), x(b + 1, r.id, !1);
        return;
      }
      const a = h.columns.get(b);
      a != null && a.config.itemClick && await A(r, b);
    }, G = (r, b, a) => {
      x(b, r.id, a);
    }, X = (r, b, a) => {
      const g = h.columns.get(b);
      if (!(g != null && g.config.actions) || g.config.actions.length === 0) return;
      g.selectedIds.has(r.id) || x(b, r.id, !1);
      const z = g.selectedIds.size, V = g.config.actions.filter((_) => {
        if (z === 1) {
          if (_.showOnSingleSelect !== void 0 && !_.showOnSingleSelect || _.showOnMultipleSelect === !0 && _.showOnSingleSelect !== void 0 && !_.showOnSingleSelect) return !1;
        } else if (z > 1 && (_.showOnMultipleSelect !== void 0 && !_.showOnMultipleSelect || _.showOnSingleSelect === !0 && _.showOnMultipleSelect !== void 0 && !_.showOnMultipleSelect))
          return !1;
        const j = g.items.filter((re) => g.selectedIds.has(re.id));
        return !(_.visible && !_.visible(j));
      });
      V.length !== 0 && ($.visible = !0, $.x = a.clientX, $.y = a.clientY, $.actions = V, $.targetItem = r, $.targetColumnIndex = b);
    }, P = () => {
      $.visible = !1;
    }, n = async (r) => {
      $.targetColumnIndex >= 0 && await F($.targetColumnIndex, r);
    }, c = (r) => {
      O(r);
    }, s = async (r) => {
      await S(r);
    }, v = async (r) => {
      await M(r);
    }, l = async (r, b) => {
      await F(b, r);
    }, o = (r, b, a) => {
      R(a, r, b);
    }, m = (r, b) => {
      H(b, r);
    };
    return f({
      store: h,
      openColumn: (r) => y(r),
      refresh: () => S(p.value)
    }), (r, b) => (i(), u("div", Ot, [
      W(d).length > 0 ? (i(), N(Le, {
        key: 0,
        breadcrumb: W(d),
        onNavigate: c
      }, null, 8, ["breadcrumb"])) : w("", !0),
      C("div", At, [
        C("div", {
          ref_key: "viewportRef",
          ref: D,
          class: "explorer-viewport"
        }, [
          (i(!0), u(E, null, L(W(k), (a, g) => (i(), N(It, {
            key: g,
            "column-state": a,
            index: g,
            "is-active": g === W(p),
            onItemClick: T,
            onItemSelect: G,
            onContextMenu: X,
            onRefresh: s,
            onLoadMore: v,
            onAction: l,
            onFilterChange: o,
            onSortChange: m
          }, null, 8, ["column-state", "index", "is-active"]))), 128))
        ], 512)
      ]),
      K(Bt, {
        visible: $.visible,
        x: $.x,
        y: $.y,
        actions: $.actions,
        onClose: P,
        onAction: n
      }, null, 8, ["visible", "x", "y", "actions"])
    ]));
  }
}), Nt = /* @__PURE__ */ Q(Ft, [["__scopeId", "data-v-c92ba803"]]);
function Rt(e) {
  var f, t, h;
  return {
    id: e.id,
    name: e.name,
    dataProvider: {
      fetch: async (d) => {
        if (console.log(`[ColumnBuilder-${e.id}] fetch called with params:`, d), console.log(`[ColumnBuilder-${e.id}] config.data:`, e.data), console.log(`[ColumnBuilder-${e.id}] config.fetchData:`, typeof e.fetchData), e.data)
          return console.log(`[ColumnBuilder-${e.id}] Using static data`), {
            items: Array.isArray(e.data) ? e.data : [],
            hasMore: !1
          };
        if (e.fetchData) {
          console.log(`[ColumnBuilder-${e.id}] Calling fetchData...`);
          try {
            const k = await e.fetchData(d);
            return console.log(`[ColumnBuilder-${e.id}] fetchData returned:`, k), {
              items: Array.isArray(k) ? k : [],
              hasMore: !1
            };
          } catch (k) {
            throw console.error(`[ColumnBuilder-${e.id}] Error in fetchData:`, k), k;
          }
        }
        return console.warn(`[ColumnBuilder-${e.id}] No data source provided!`), {
          items: [],
          hasMore: !1
        };
      }
    },
    selection: {
      enabled: e.allowMultipleSelection !== void 0 || !!(e.singleActions && e.singleActions.length > 0) || !!(e.multipleActions && e.multipleActions.length > 0) || !!e.onItemClick,
      // Enable selection if item is clickable
      multiple: e.allowMultipleSelection !== void 0 ? e.allowMultipleSelection : !1
    },
    filters: (f = e.filters) == null ? void 0 : f.map((d) => ({
      ...d,
      default: void 0
    })),
    sortOptions: e.sortOptions,
    actions: [
      ...((t = e.singleActions) == null ? void 0 : t.map((d) => ({
        key: d.key,
        label: d.label,
        icon: d.icon,
        color: d.color,
        skipRefresh: d.skipRefresh,
        showOnSingleSelect: !0,
        showOnMultipleSelect: !1,
        handler: async (k, p) => {
          var x;
          const y = (x = p.selectedItems) == null ? void 0 : x[0];
          if (!y) {
            console.warn(`[ColumnBuilder-${e.id}] No item found for single action: ${d.key}`);
            return;
          }
          await d.handler(y, p);
        }
      }))) || [],
      ...((h = e.multipleActions) == null ? void 0 : h.map((d) => ({
        key: d.key,
        label: d.label,
        icon: d.icon,
        color: d.color,
        skipRefresh: d.skipRefresh,
        showOnSingleSelect: !1,
        showOnMultipleSelect: !0,
        handler: async (k, p) => {
          const y = p.selectedItems || [];
          if (y.length === 0) {
            console.warn(`[ColumnBuilder-${e.id}] No items found for multiple action: ${d.key}`);
            return;
          }
          await d.handler(y, p);
        }
      }))) || []
    ],
    itemClick: e.onItemClick ? {
      type: "navigate",
      handler: async (d, k) => {
        const p = await e.onItemClick(d, k);
        return p ? { column: p } : {};
      }
    } : void 0,
    view: {
      showIcon: !0,
      showMetadata: !0,
      emptyMessage: `No ${e.name.toLowerCase()} found`
    }
  };
}
const Dt = {
  install(e) {
    e.component("ExplorerContainer", Nt);
  }
};
export {
  Nt as ExplorerContainer,
  Rt as createColumn,
  Dt as default,
  Ae as useExplorer
};
