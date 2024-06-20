import { Component } from '@angular/core';
import { FormService } from 'src/app/modules/form/form.service';
import { OrderService, Order } from 'src/app/modules/order/services/order.service';
import {
	AlertService,
	CoreService,
	MongoService,
	StoreService as _StoreService
} from 'wacom';
import { TranslateService } from 'src/app/modules/translate/translate.service';
import { FormInterface } from 'src/app/modules/form/interfaces/form.interface';
import { StoreService, Store } from 'src/app/modules/store/services/store.service';

@Component({
	templateUrl: './orders.component.html',
	styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {
	columns = ['date', 'products', 'information', 'price', 'status'];

	form: FormInterface = this._form.getForm('orders', {
		formId: 'orders',
		title: 'Orders',
		components: [
			{
				name: 'Text',
				key: 'name',
				focused: true,
				fields: [
					{
						name: 'Placeholder',
						value: 'fill orders title'
					},
					{
						name: 'Label',
						value: 'Title'
					}
				]
			},
			{
				name: 'Text',
				key: 'description',
				fields: [
					{
						name: 'Placeholder',
						value: 'fill orders description'
					},
					{
						name: 'Label',
						value: 'Description'
					}
				]
			},
			{
				name: 'Select',
				key: 'stores',
				fields: [
					{
						name: 'Placeholder',
						value: 'fill your stores'
					},
					{
						name: 'Label',
						value: 'Stores'
					},
					{
						name: 'Multiple',
						value: true
					},
					{
						name: 'Items',
						value: this.stores
					}
				]
			}
		]
	});

	config = {
		create: () => {
			this._form.modal<Order>(this.form, {
				label: 'Create',
				click: (created: unknown, close: () => void) => {
					this._os.create(
						created as Order,
						this.setOrders.bind(this)
					);
					close();
				}
			}, this.store ? { stores: [this.store] } : {});
		},
		update: (doc: Order) => {
			this._form
				.modal<Order>(this.form, [], doc)
				.then((updated: Order) => {
					this._core.copy(updated, doc);
					this._os.save(doc);
				});
		}
		// ,
		// delete: (doc: Order) => {
		// 	this._alert.question({
		// 		text: this._translate.translate(
		// 			'Common.Are you sure you want to delete this cservice?'
		// 		),
		// 		buttons: [
		// 			{
		// 				text: this._translate.translate('Common.No')
		// 			},
		// 			{
		// 				text: this._translate.translate('Common.Yes'),
		// 				callback: () => {
		// 					this._os.delete(doc);
		// 				}
		// 			}
		// 		]
		// 	});
		// }
	};

	orders: Order[] = [];
	setOrders() {
		this.orders.splice(0, this.orders.length);
		for (const order of this._os.orders) {
			order.stores = order.stores || [];
			if (this.store) {
				if (order.stores.includes(this.store)) {
					this.orders.push(order);
				}
			} else {
				this.orders.push(order);
			}
		}
	}

	setStatus(order: Order, status:string) {
	 	order.status = status;
		this.update(order);
		
	}

	update(order: Order) {
		this._os.update(order);
	}

	get stores(): Store[] {
		return this._ss.stores;
	}
	store: string;
	setStore(store: string) {
		this.store = store;
		this._store.set('store', store);
		this.setOrders();
	}

	constructor(
		public _os: OrderService,
		private _translate: TranslateService,
		private _alert: AlertService,
		private _form: FormService,
		private _core: CoreService,
		private _store: _StoreService,
		private _ss: StoreService,
		private _mongo: MongoService
	) {
		this._store.get('store', this.setStore.bind(this));
		this._mongo.on('order', this.setOrders.bind(this));
	}

	getProductsTotal(order: Order): number {
		return order.products.reduce((accumulator, product) => accumulator + product.product.price, 0);
	}
}
