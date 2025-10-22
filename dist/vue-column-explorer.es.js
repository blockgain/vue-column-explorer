import { defineComponent as N, createElementBlock as i, openBlock as s, Fragment as I, renderList as w, createElementVNode as v, createBlock as $, createCommentVNode as g, normalizeClass as B, toDisplayString as y, unref as M, computed as A, withModifiers as U, resolveDynamicComponent as V, createVNode as z, ref as j, createStaticVNode as Z, createTextVNode as K, onMounted as ee, onUnmounted as te, Teleport as ne, normalizeStyle as le, reactive as oe } from "vue";
import { defineStore as se } from "pinia";
import { ChevronRight as W, Folder as G, File as R, Clipboard as ce, FileText as ie, Book as ae, User as re, Filter as ue, RefreshCw as de, Mail as me, Edit as X, Download as Y, Trash as J, Eye as he } from "lucide-vue-next";
const fe = se("explorer", {
  state: () => ({
    columns: /* @__PURE__ */ new Map(),
    activeColumnIndex: -1,
    breadcrumb: [],
    globalFilters: {},
    config: {
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
    }
  }),
  getters: {
    visibleColumns() {
      const e = [];
      for (let o = 0; o <= this.activeColumnIndex; o++) {
        const t = this.columns.get(o);
        t && e.push(t);
      }
      return e;
    },
    currentSelection() {
      const e = this.columns.get(this.activeColumnIndex);
      return (e == null ? void 0 : e.selectedIds) || /* @__PURE__ */ new Set();
    },
    canNavigateForward() {
      const e = this.columns.get(this.activeColumnIndex);
      return e ? e.selectedIds.size > 0 : !1;
    },
    getContext() {
      var t;
      const e = [];
      for (let n = 0; n <= this.activeColumnIndex; n++) {
        const l = this.columns.get(n);
        if (l) {
          const a = Array.from(l.selectedIds)[0], r = a && l.items.find((f) => f.id === a) || null;
          e.push({
            columnId: l.config.id,
            selectedItem: r,
            selectedIds: l.selectedIds
          });
        }
      }
      const o = e[e.length - 2];
      return {
        parentId: ((t = o == null ? void 0 : o.selectedItem) == null ? void 0 : t.id) || null,
        parentItem: (o == null ? void 0 : o.selectedItem) || null,
        breadcrumb: this.breadcrumb,
        globalFilters: this.globalFilters,
        columnChain: e,
        getParentData(n) {
          return e[e.length - 1 - n];
        },
        getColumnData(n) {
          return e.find((l) => l.columnId === n);
        }
      };
    }
  },
  actions: {
    setConfig(e) {
      this.config = {
        appearance: { ...this.config.appearance, ...e.appearance },
        behavior: { ...this.config.behavior, ...e.behavior },
        performance: { ...this.config.performance, ...e.performance }
      };
    },
    async openColumn(e, o) {
      const t = o ?? this.activeColumnIndex + 1;
      for (let l = this.columns.size - 1; l > t; l--)
        this.columns.delete(l);
      const n = {
        config: e,
        items: [],
        selectedIds: /* @__PURE__ */ new Set(),
        page: 0,
        hasMore: !0,
        isLoading: !1,
        error: null,
        filters: {}
      };
      this.columns.set(t, n), this.activeColumnIndex = t, t === 0 && (this.breadcrumb = [{
        columnId: e.id,
        columnName: e.name
      }]), await this.loadColumnData(t);
    },
    async loadColumnData(e, o = 0) {
      const t = this.columns.get(e);
      if (t) {
        t.isLoading = !0, t.error = null, o === 0 && (t.items = []);
        try {
          const n = this.getContext, l = await t.config.dataProvider.fetch({
            parentId: n.parentId,
            page: o,
            filters: { ...this.globalFilters, ...t.filters },
            context: n
          });
          o === 0 ? t.items = l.items : t.items.push(...l.items), t.hasMore = l.hasMore, t.page = o;
        } catch (n) {
          t.error = n, console.error("Error loading column data:", n);
        } finally {
          t.isLoading = !1;
        }
      }
    },
    async loadNextPage(e) {
      const o = this.columns.get(e);
      !o || !o.hasMore || o.isLoading || await this.loadColumnData(e, o.page + 1);
    },
    async refreshColumn(e) {
      const o = this.columns.get(e);
      o && (o.selectedIds.clear(), o.page = 0, await this.loadColumnData(e, 0));
    },
    selectItem(e, o, t = !1) {
      var l;
      const n = this.columns.get(e);
      !n || !((l = n.config.selection) != null && l.enabled) || (t && n.config.selection.multiple ? n.selectedIds.has(o) ? n.selectedIds.delete(o) : n.selectedIds.add(o) : (n.selectedIds.clear(), n.selectedIds.add(o)));
    },
    clearSelection(e) {
      const o = this.columns.get(e);
      o && o.selectedIds.clear();
    },
    async navigateToItem(e, o) {
      var a, r, f;
      const t = this.columns.get(o);
      if (!t || !t.config.itemClick) return;
      const n = this.getContext, l = await ((r = (a = t.config.itemClick).handler) == null ? void 0 : r.call(a, e, n));
      if (l != null && l.column)
        this.breadcrumb = this.breadcrumb.slice(0, o + 1), await this.openColumn(l.column, o + 1), this.breadcrumb.push({
          columnId: l.column.id,
          columnName: e.name,
          // Show selected item name in breadcrumb
          itemId: e.id,
          itemName: e.name
        });
      else if (l != null && l.action) {
        const x = (f = t.config.actions) == null ? void 0 : f.find((_) => _.key === l.action);
        x && await this.executeAction(o, x.key);
      } else l != null && l.custom && l.custom();
    },
    async executeAction(e, o) {
      var a;
      const t = this.columns.get(e);
      if (!t) return;
      const n = (a = t.config.actions) == null ? void 0 : a.find((r) => r.key === o);
      if (!n) return;
      const l = Array.from(t.selectedIds);
      if (l.length !== 0)
        try {
          const r = this.getContext;
          await n.handler(l, r), await this.refreshColumn(e);
        } catch (r) {
          console.error("Error executing action:", r);
        }
    },
    navigateToBreadcrumb(e) {
      for (let o = this.columns.size - 1; o > e; o--)
        this.columns.delete(o);
      this.activeColumnIndex = e, this.breadcrumb = this.breadcrumb.slice(0, e + 1);
    },
    setFilter(e, o, t) {
      const n = this.columns.get(e);
      n && (t == null || t === "" ? delete n.filters[o] : n.filters[o] = t, this.loadColumnData(e, 0));
    },
    setGlobalFilter(e, o) {
      o == null || o === "" ? delete this.globalFilters[e] : this.globalFilters[e] = o, this.visibleColumns.forEach((t, n) => {
        this.loadColumnData(n, 0);
      });
    }
  }
}), ve = { class: "explorer-breadcrumb" }, be = ["onClick"], ge = /* @__PURE__ */ N({
  __name: "ExplorerBreadcrumb",
  props: {
    breadcrumb: {}
  },
  emits: ["navigate"],
  setup(e, { emit: o }) {
    const t = o, n = (l) => {
      t("navigate", l);
    };
    return (l, a) => (s(), i("div", ve, [
      (s(!0), i(I, null, w(e.breadcrumb, (r, f) => (s(), i("div", {
        key: f,
        class: "breadcrumb-item"
      }, [
        v("button", {
          class: B(["breadcrumb-item__button", { "breadcrumb-item__button--active": f === e.breadcrumb.length - 1 }]),
          onClick: (x) => n(f)
        }, y(r.itemName || r.columnName), 11, be),
        f < e.breadcrumb.length - 1 ? (s(), $(M(W), {
          key: 0,
          size: 16,
          class: "breadcrumb-separator"
        })) : g("", !0)
      ]))), 128))
    ]));
  }
}), L = (e, o) => {
  const t = e.__vccOpts || e;
  for (const [n, l] of o)
    t[n] = l;
  return t;
}, xe = /* @__PURE__ */ L(ge, [["__scopeId", "data-v-27ca8931"]]), ke = {
  key: 0,
  class: "explorer-item__checkbox"
}, Ce = ["checked"], pe = { class: "explorer-item__content" }, ye = {
  key: 0,
  class: "explorer-item__icon"
}, _e = { class: "explorer-item__details" }, Se = { class: "explorer-item__name" }, Ie = {
  key: 0,
  class: "explorer-item__metadata"
}, we = {
  key: 1,
  class: "explorer-item__chevron"
}, Me = {
  key: 0,
  class: "item-count"
}, $e = /* @__PURE__ */ N({
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
  setup(e, { emit: o }) {
    const t = e, n = o, l = A(() => t.item.icon ? {
      "lucide:user": re,
      "lucide:folder": G,
      "lucide:file": R,
      "lucide:book": ae,
      "lucide:file-text": ie,
      "lucide:clipboard": ce
    }[t.item.icon] || R : t.item.type === "folder" ? G : R), a = (h) => {
      t.clickable && n("click", t.item, h);
    }, r = (h) => {
      n("dblclick", t.item, h);
    }, f = (h) => {
      n("contextmenu", t.item, h);
    }, x = (h) => {
      n("select", t.item, !0);
    }, _ = (h) => {
      const S = Object.entries(h);
      if (S.length === 0) return "";
      const E = S[0];
      return String(E[1]);
    };
    return (h, S) => (s(), i("div", {
      class: B(["explorer-item", {
        "explorer-item--selected": e.selected,
        "explorer-item--clickable": e.clickable
      }]),
      onClick: a,
      onDblclick: r,
      onContextmenu: U(f, ["prevent"])
    }, [
      e.selectable ? (s(), i("div", ke, [
        v("input", {
          type: "checkbox",
          checked: e.selected,
          onClick: U(x, ["stop"])
        }, null, 8, Ce)
      ])) : g("", !0),
      v("div", pe, [
        e.showIcon ? (s(), i("div", ye, [
          (s(), $(V(l.value), { size: 20 }))
        ])) : g("", !0),
        v("div", _e, [
          v("div", Se, y(e.item.name), 1),
          e.showMetadata && e.item.metadata ? (s(), i("div", Ie, y(_(e.item.metadata)), 1)) : g("", !0)
        ])
      ]),
      e.item.count !== void 0 || e.item.hasChildren ? (s(), i("div", we, [
        e.item.count !== void 0 ? (s(), i("span", Me, y(e.item.count), 1)) : g("", !0),
        z(M(W), { size: 16 })
      ])) : g("", !0)
    ], 34));
  }
}), Ae = /* @__PURE__ */ L($e, [["__scopeId", "data-v-b2b4e9d4"]]), Ee = { class: "explorer-column__header" }, Fe = { class: "explorer-column__title" }, Be = { class: "explorer-column__actions" }, Ne = {
  key: 0,
  class: "explorer-column__filters"
}, Le = { class: "filter-item__label" }, De = ["placeholder", "value", "onInput"], ze = ["placeholder", "value", "onInput"], Oe = ["value", "onChange"], Te = ["value"], Pe = {
  key: 0,
  class: "explorer-column__loading"
}, Re = {
  key: 1,
  class: "explorer-column__error"
}, Ve = {
  key: 2,
  class: "explorer-column__empty"
}, qe = {
  key: 3,
  class: "explorer-column__items"
}, He = {
  key: 0,
  class: "explorer-column__loading-more"
}, Ue = {
  key: 1,
  class: "explorer-column__footer"
}, je = { class: "explorer-column__selection-info" }, Ge = { class: "explorer-column__quick-actions" }, We = ["onClick"], Xe = /* @__PURE__ */ N({
  __name: "ExplorerColumn",
  props: {
    columnState: {},
    index: {},
    isActive: { type: Boolean }
  },
  emits: ["item-click", "item-select", "context-menu", "refresh", "load-more", "action", "filter-change"],
  setup(e, { emit: o }) {
    const t = e, n = o, l = j(null), a = j(!1), r = A(() => t.columnState.config.filters && t.columnState.config.filters.length > 0), f = A(() => t.columnState.selectedIds.size > 0), x = A(() => {
      var d;
      return ((d = t.columnState.config.view) == null ? void 0 : d.loadingRows) || 10;
    }), _ = A(() => {
      var d;
      return ((d = t.columnState.config.view) == null ? void 0 : d.emptyMessage) || "No items found";
    }), h = A(() => t.columnState.isLoading && t.columnState.items.length === 0), S = A(() => {
      if (!t.columnState.config.actions) return [];
      const d = t.columnState.items.filter(
        (c) => t.columnState.selectedIds.has(c.id)
      ), m = d.length;
      return t.columnState.config.actions.filter((c) => m === 1 && c.showOnSingleSelect === !1 || m > 1 && c.showOnMultipleSelect === !1 || m === 1 && c.showOnMultipleSelect === !0 && c.showOnSingleSelect === !1 || m > 1 && c.showOnSingleSelect === !0 && c.showOnMultipleSelect === !1 ? !1 : c.visible ? c.visible(d) : !0);
    }), E = () => {
      a.value = !a.value;
    }, O = (d, m) => {
      n("item-click", d, t.index);
    }, T = (d, m) => {
      n("item-select", d, t.index, m);
    }, u = (d, m) => {
      n("context-menu", d, t.index, m);
    }, b = () => {
      n("refresh", t.index);
    }, k = () => {
      if (!l.value) return;
      const { scrollTop: d, scrollHeight: m, clientHeight: c } = l.value;
      d + c >= m - 100 && t.columnState.hasMore && !t.columnState.isLoading && n("load-more", t.index);
    }, p = (d) => {
      n("action", d, t.index);
    }, P = (d, m) => {
      n("filter-change", d, m, t.index);
    }, Q = (d) => ({
      "lucide:trash": J,
      "lucide:download": Y,
      "lucide:edit": X,
      "lucide:mail": me
    })[d] || null;
    return (d, m) => (s(), i("div", {
      class: B(["explorer-column", { "explorer-column--active": e.isActive }])
    }, [
      v("div", Ee, [
        v("h3", Fe, y(e.columnState.config.name), 1),
        v("div", Be, [
          r.value ? (s(), i("button", {
            key: 0,
            class: B(["explorer-column__filter-btn", { active: a.value }]),
            onClick: E
          }, [
            z(M(ue), { size: 16 })
          ], 2)) : g("", !0),
          v("button", {
            class: "explorer-column__refresh-btn",
            onClick: b
          }, [
            z(M(de), { size: 16 })
          ])
        ])
      ]),
      a.value && r.value ? (s(), i("div", Ne, [
        (s(!0), i(I, null, w(e.columnState.config.filters, (c) => (s(), i("div", {
          key: c.key,
          class: "filter-item"
        }, [
          v("label", Le, y(c.label), 1),
          c.type === "search" ? (s(), i("input", {
            key: 0,
            type: "text",
            class: "filter-item__input",
            placeholder: `Search ${c.label.toLowerCase()}...`,
            value: e.columnState.filters[c.key] || "",
            onInput: (C) => P(c.key, C.target.value)
          }, null, 40, De)) : c.type === "number" ? (s(), i("input", {
            key: 1,
            type: "number",
            class: "filter-item__input",
            placeholder: c.label,
            value: e.columnState.filters[c.key] || "",
            onInput: (C) => P(c.key, C.target.value)
          }, null, 40, ze)) : c.type === "select" ? (s(), i("select", {
            key: 2,
            class: "filter-item__select",
            value: e.columnState.filters[c.key] || "",
            onChange: (C) => P(c.key, C.target.value)
          }, [
            m[0] || (m[0] = v("option", { value: "" }, "All", -1)),
            (s(!0), i(I, null, w(c.options, (C) => (s(), i("option", {
              key: C.value,
              value: C.value
            }, y(C.label), 9, Te))), 128))
          ], 40, Oe)) : g("", !0)
        ]))), 128))
      ])) : g("", !0),
      v("div", {
        ref_key: "scrollContainer",
        ref: l,
        class: "explorer-column__content",
        onScroll: k
      }, [
        h.value ? (s(), i("div", Pe, [
          (s(!0), i(I, null, w(x.value, (c) => (s(), i("div", {
            key: c,
            class: "skeleton-item"
          }, [...m[1] || (m[1] = [
            Z('<div class="skeleton-item__icon" data-v-b8fd4b62></div><div class="skeleton-item__content" data-v-b8fd4b62><div class="skeleton-item__name" data-v-b8fd4b62></div><div class="skeleton-item__metadata" data-v-b8fd4b62></div></div><div class="skeleton-item__chevron" data-v-b8fd4b62></div>', 3)
          ])]))), 128))
        ])) : e.columnState.error ? (s(), i("div", Re, [
          m[2] || (m[2] = v("p", null, "Error loading data", -1)),
          v("button", { onClick: b }, "Retry")
        ])) : e.columnState.items.length === 0 && !e.columnState.isLoading ? (s(), i("div", Ve, y(_.value), 1)) : e.columnState.items.length > 0 ? (s(), i("div", qe, [
          (s(!0), i(I, null, w(e.columnState.items, (c) => {
            var C, q, H;
            return s(), $(Ae, {
              key: c.id,
              item: c,
              selected: e.columnState.selectedIds.has(c.id),
              selectable: ((C = e.columnState.config.selection) == null ? void 0 : C.multiple) ?? !1,
              clickable: !0,
              "show-icon": ((q = e.columnState.config.view) == null ? void 0 : q.showIcon) ?? !0,
              "show-metadata": ((H = e.columnState.config.view) == null ? void 0 : H.showMetadata) ?? !0,
              onClick: (F, D) => O(F),
              onSelect: (F, D) => T(F, D),
              onContextmenu: (F, D) => u(F, D)
            }, null, 8, ["item", "selected", "selectable", "show-icon", "show-metadata", "onClick", "onSelect", "onContextmenu"]);
          }), 128)),
          e.columnState.isLoading && e.columnState.items.length > 0 ? (s(), i("div", He, " Loading more... ")) : g("", !0)
        ])) : g("", !0)
      ], 544),
      f.value ? (s(), i("div", Ue, [
        v("div", je, y(e.columnState.selectedIds.size) + " selected ", 1),
        v("div", Ge, [
          (s(!0), i(I, null, w(S.value, (c) => (s(), i("button", {
            key: c.key,
            class: B(["action-btn", `action-btn--${c.color || "default"}`]),
            onClick: (C) => p(c.key)
          }, [
            c.icon ? (s(), $(V(Q(c.icon)), {
              key: 0,
              size: 14
            })) : g("", !0),
            K(" " + y(c.label), 1)
          ], 10, We))), 128))
        ])
      ])) : g("", !0)
    ], 2));
  }
}), Ye = /* @__PURE__ */ L(Xe, [["__scopeId", "data-v-b8fd4b62"]]), Je = ["onClick"], Qe = /* @__PURE__ */ N({
  __name: "ExplorerContextMenu",
  props: {
    visible: { type: Boolean },
    x: {},
    y: {},
    actions: {}
  },
  emits: ["close", "action"],
  setup(e, { emit: o }) {
    const t = e, n = o, l = () => {
      n("close");
    }, a = (x) => {
      n("action", x.key), n("close");
    }, r = (x) => ({
      "lucide:download": Y,
      "lucide:trash": J,
      "lucide:edit": X,
      "lucide:eye": he
    })[x] || null, f = () => {
      t.visible && n("close");
    };
    return ee(() => {
      document.addEventListener("click", f);
    }), te(() => {
      document.removeEventListener("click", f);
    }), (x, _) => (s(), $(ne, { to: "body" }, [
      e.visible ? (s(), i("div", {
        key: 0,
        class: "context-menu",
        style: le({ top: `${e.y}px`, left: `${e.x}px` }),
        onClick: l
      }, [
        (s(!0), i(I, null, w(e.actions, (h) => (s(), i("div", {
          key: h.key,
          class: "context-menu__item",
          onClick: (S) => a(h)
        }, [
          h.icon ? (s(), $(V(r(h.icon)), {
            key: 0,
            size: 16
          })) : g("", !0),
          v("span", null, y(h.label), 1)
        ], 8, Je))), 128))
      ], 4)) : g("", !0)
    ]));
  }
}), Ze = /* @__PURE__ */ L(Qe, [["__scopeId", "data-v-569d2f59"]]), Ke = { class: "explorer-container" }, et = { class: "explorer-viewport" }, tt = /* @__PURE__ */ N({
  __name: "ExplorerContainer",
  props: {
    rootColumn: {}
  },
  setup(e, { expose: o }) {
    const t = e, n = fe(), l = oe({
      visible: !1,
      x: 0,
      y: 0,
      actions: [],
      targetItem: null,
      targetColumnIndex: -1
    });
    t.rootColumn && n.openColumn(t.rootColumn, 0);
    const a = async (u, b) => {
      n.selectItem(b, u.id, !1);
      const k = n.columns.get(b);
      k != null && k.config.itemClick && await n.navigateToItem(u, b);
    }, r = (u, b, k) => {
      n.selectItem(b, u.id, k);
    }, f = (u, b, k) => {
      const p = n.columns.get(b);
      !(p != null && p.config.actions) || p.config.actions.length === 0 || (p.selectedIds.has(u.id) || n.selectItem(b, u.id, !1), l.visible = !0, l.x = k.clientX, l.y = k.clientY, l.actions = p.config.actions, l.targetItem = u, l.targetColumnIndex = b);
    }, x = () => {
      l.visible = !1;
    }, _ = async (u) => {
      l.targetColumnIndex >= 0 && await n.executeAction(l.targetColumnIndex, u);
    }, h = (u) => {
      n.navigateToBreadcrumb(u);
    }, S = async (u) => {
      await n.refreshColumn(u);
    }, E = async (u) => {
      await n.loadNextPage(u);
    }, O = async (u, b) => {
      await n.executeAction(b, u);
    }, T = (u, b, k) => {
      n.setFilter(k, u, b);
    };
    return o({
      store: n,
      openColumn: (u) => n.openColumn(u),
      refresh: () => n.refreshColumn(n.activeColumnIndex)
    }), (u, b) => (s(), i("div", Ke, [
      M(n).breadcrumb.length > 0 ? (s(), $(xe, {
        key: 0,
        breadcrumb: M(n).breadcrumb,
        onNavigate: h
      }, null, 8, ["breadcrumb"])) : g("", !0),
      v("div", et, [
        (s(!0), i(I, null, w(M(n).visibleColumns, (k, p) => (s(), $(Ye, {
          key: p,
          "column-state": k,
          index: p,
          "is-active": p === M(n).activeColumnIndex,
          onItemClick: a,
          onItemSelect: r,
          onContextMenu: f,
          onRefresh: S,
          onLoadMore: E,
          onAction: O,
          onFilterChange: T
        }, null, 8, ["column-state", "index", "is-active"]))), 128))
      ]),
      z(Ze, {
        visible: l.visible,
        x: l.x,
        y: l.y,
        actions: l.actions,
        onClose: x,
        onAction: _
      }, null, 8, ["visible", "x", "y", "actions"])
    ]));
  }
}), nt = /* @__PURE__ */ L(tt, [["__scopeId", "data-v-4e9a0e53"]]);
function ct(e) {
  var o, t, n;
  return {
    id: e.id,
    name: e.name,
    dataProvider: {
      fetch: async (l) => {
        const a = await e.fetchData(l);
        return {
          items: Array.isArray(a) ? a : [],
          hasMore: !1
        };
      }
    },
    selection: {
      enabled: e.allowMultipleSelection !== void 0 || !!(e.singleActions && e.singleActions.length > 0) || !!(e.multipleActions && e.multipleActions.length > 0),
      multiple: e.allowMultipleSelection !== void 0 ? e.allowMultipleSelection : !1
    },
    filters: (o = e.filters) == null ? void 0 : o.map((l) => ({
      ...l,
      default: void 0
    })),
    actions: [
      ...((t = e.singleActions) == null ? void 0 : t.map((l) => ({
        key: l.key,
        label: l.label,
        icon: l.icon,
        color: l.color,
        showOnSingleSelect: !0,
        showOnMultipleSelect: !1,
        handler: async (a, r) => {
          await l.handler(a);
        }
      }))) || [],
      ...((n = e.multipleActions) == null ? void 0 : n.map((l) => ({
        key: l.key,
        label: l.label,
        icon: l.icon,
        color: l.color,
        showOnSingleSelect: !1,
        showOnMultipleSelect: !0,
        handler: async (a, r) => {
          await l.handler(a);
        }
      }))) || []
    ],
    itemClick: e.onItemClick ? {
      type: "navigate",
      handler: async (l, a) => {
        const r = e.onItemClick(l, a);
        return r ? { column: r } : {};
      }
    } : void 0,
    view: {
      showIcon: !0,
      showMetadata: !0,
      emptyMessage: `No ${e.name.toLowerCase()} found`
    }
  };
}
const it = {
  install(e) {
    e.component("ExplorerContainer", nt);
  }
};
export {
  nt as ExplorerContainer,
  ct as createColumn,
  it as default,
  fe as useExplorerStore
};
